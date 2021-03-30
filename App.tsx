/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable eslint-comments/no-unused-disable */
/* eslint-disable no-trailing-spaces */
/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, NativeModules, NativeEventEmitter, Button, Platform, PermissionsAndroid, FlatList, TouchableHighlight, TextInput } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import BleManager from 'react-native-ble-manager';
import { Peripheral } from 'react-native-ble-manager';
import useScanning from './useScanning';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

interface BtCounterPeripheral {
    peripheral: Peripheral;
    connected: boolean;
}

const timeout = (ms: number): Promise<void> => {
    return new Promise(resolve => {
        console.log(`Initiating timeout of ${ms} msec.`);
        setTimeout(resolve, ms);
    });
}

const App = () => {
    const peripherals = React.useMemo(() => new Map<string, BtCounterPeripheral>(), []);
    const [list, setList] = useState([] as any[]);
    const [isCollecting, setCollecting] = useState(false);
    const [nowCount, setNowCount] = useState(0);

    const retrieveServices = async (id: string) => {
        let peripheralData = await BleManager.retrieveServices(id);
        console.log('Retrieved peripheral services', JSON.stringify(peripheralData));
    };

    const retrieveRssi = async (id: string, p: BtCounterPeripheral | undefined): Promise<void> => {
        let rssi = await BleManager.readRSSI(id);
        console.log('Retrieved actual RSSI value', rssi);
        p = peripherals.get(id);
        if (p) {
            p.peripheral.rssi = Number.parseFloat("" + rssi);
            peripherals.set(id, p);
            setList(Array.from(peripherals.values()));
        }
    };

    const startNotification = async (id: string) => {
        try {
            await BleManager.startNotification(id, 'FFE0', 'FFE1');
            console.log("Notification started");
        } catch (error) {
            console.log(error);
        }
    };

    const stopNotification = async (id: string) => {
        try {
            await BleManager.stopNotification(id, 'FFE0', 'FFE1');
            console.log("Notification stopped");
        } catch (error) {
            console.log(error);
        }
    };

    const connect = async (peripheral: BtCounterPeripheral) => {
        const id = peripheral.peripheral.id;
        console.log('Connecting to ' + id);
        await BleManager.connect(id);
        console.log('Connected to ' + id);
        await timeout(100);
        /* Test read current RSSI value */
        console.log('Getting services for ' + id);
        await retrieveServices(id);
        // await retrieveRssi(id, p);
        console.log('Got services for ' + id);

        console.log('Start notification for ' + id);
        await startNotification(id);
        peripheral.connected = true;
        console.log('Connected to ' + id);
    };

    const disconnect = async (peripheral: BtCounterPeripheral) => {
        const id = peripheral.peripheral.id;
        console.log('Disconnecting from ' + id);
        await stopNotification(id);
        await BleManager.disconnect(id);
        peripheral.connected = false;
        console.log('Disconnected from ' + id);
    };
    
    const retrieveConnected = () => {
        BleManager.getConnectedPeripherals([]).then((results) => {
            if (results.length == 0) {
                console.log('No connected peripherals');
            }
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                let peripheral = results[i] as Peripheral;
                let connected = true;
                let btCounterPeripheral = { peripheral, connected } as BtCounterPeripheral;


                peripherals.set(peripheral.id, btCounterPeripheral);
                setList(Array.from(peripherals.values()));
            }
        });
    }

    const toggleConnection = (peripheral: BtCounterPeripheral) => {
        (async () => {
            const id = peripheral.peripheral.id;
            console.log(`peripheral = ${JSON.stringify(peripheral)}`);
            if (peripheral) {
                if (peripheral.connected) {
                    await disconnect(peripheral);
                } else {
                    await connect(peripheral);
                }
                let p = peripherals.get(id);
                if (p) {
                    peripherals.set(id, p);
                    setList(Array.from(peripherals.values()));
                }
            }
        })();
    };

    const [handleStopScan, startScan, stopScan, ScanButton] = useScanning(() => {
        peripherals.clear();
        setList([]);
    });

    useEffect(() => {
        (async () => {
            try {
                console.log('BT Counter initialisation ... Started');
                await BleManager.start({ showAlert: false });

                const handleDiscoverPeripheral = (peripheral: Peripheral) => {
                    if (peripheral.name === 'CC2650 SensorTag') {
                        console.log(`Got SensorTag: ${peripheral.id}`);
                        if(!peripherals.get(peripheral.id)) {
                            console.log(`Adding SensorTag: ${peripheral.id}`);
                            let btPeripheral = { connected: false, peripheral: peripheral } as BtCounterPeripheral;
                            peripherals.set(peripheral.id, btPeripheral);
                            stopScan();
                            setList(Array.from(peripherals.values()));
                        } else {
                            console.log(`SensorTag: id = ${peripheral.id} already in the list.`);
                        }
                    } else {
                        console.log('Not SensorTag - ignoring');
                    }
                };

                const handleDisconnectedPeripheral = (data: any) => {
                    let peripheral = peripherals.get(data.peripheral);
                    if (peripheral) {
                        peripheral.connected = false;
                        peripherals.set(peripheral.peripheral.id, peripheral);
                        setList(Array.from(peripherals.values()));
                    }
                    console.log('Disconnected from ' + data.peripheral);
                };

                const handleUpdateValueForCharacteristic = (data: any) => {
                    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
                    if (data.value[0]) {
                        setNowCount(nowCount + 1);
                    }
                }

                bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
                bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
                bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
                bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

                if (Platform.OS === 'android' && Platform.Version >= 23) {
                    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                        if (result) {
                            console.log("Permission is OK");
                        } else {
                            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                                if (result) {
                                    console.log("User accept");
                                } else {
                                    console.log("User refuse");
                                }
                            });
                        }
                    });
                }
                console.log('BT Counter initialisation ... Completed');

                return (() => {
                    bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
                    bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
                    bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
                    bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
                });
            } catch (error) {
            }
        })();
    }, []);

    const renderItem = (item: BtCounterPeripheral) => {
        // console.log(`item=${JSON.stringify(item)}`);
        const color = item.connected ? 'green' : '#fff';
        return (
            <TouchableHighlight onPress={() => toggleConnection(item)} key={item.peripheral.id}>
                <View style={[styles.row, { backgroundColor: color }]}>
                    <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{item.peripheral.name}</Text>
                    <Text style={{ fontSize: 10, textAlign: 'center', color: '#333333', padding: 2 }}>RSSI: {item.peripheral.rssi}</Text>
                    <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20 }}>{item.peripheral.id}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}>
                    <View style={styles.body}>
                        <ScanButton />

                        <View style={{ margin: 10 }}>
                            <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()} />
                        </View>

                        {(list.length === 0) &&
                            <View style={{ flex: 1, margin: 20 }}>
                                <Text style={{ textAlign: 'center' }}>No peripherals</Text>
                            </View>
                        }

                    </View>
                </ScrollView>
                <FlatList
                    data={list}
                    renderItem={({ item }) => renderItem(item)}
                    keyExtractor={item => item.id}
                />
                <View style={{ margin: 10, flexDirection: "row", justifyContent: 'space-between' }}>
                    <TouchableHighlight>
                        <Button title="Start" onPress={() => { setCollecting(true) }} />
                    </TouchableHighlight>
                    <TextInput style={{ backgroundColor: "red", flex: 0.5 }}>{nowCount}</TextInput>
                    <TouchableHighlight>
                        <Button title="Stop" onPress={() => setCollecting(false)} />
                    </TouchableHighlight>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
});

export default App;
