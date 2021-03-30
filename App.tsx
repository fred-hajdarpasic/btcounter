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
    const [isScanInProgress, setIsScanInProgress] = useState(false);
    const [isScanTransitioning, setIsScanTransitioning] = useState(false);
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
        await BleManager.startNotification(id, 'FFE0', 'FFE1')
            .then(() => {
                console.log("Notification started");
            })
            .catch((error) => {
                console.log(error);
        });
    };

    const stopNotification = async (id: string) => {
        await BleManager.stopNotification(id, 'FFE0', 'FFE1')
            .then(() => {
                console.log("Notification stopped");
            })
            .catch((error) => {
                console.log(error);
        });
    };

    const startScan = () => {
        if (!isScanInProgress) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setIsScanInProgress(true);
            setIsScanTransitioning(true);
            console.log('Initiating Scanning...');
            setList([]);
            BleManager.scan([], 20, true).then(() => {
                console.log('Peripheral started scanning...');
            }).catch(err => {
                console.error(err);
            });
            setIsScanTransitioning(false);
        } else {
            console.log('This is wrong - it is already scanning ...');
        }
    };

    const stopScan = () => {
        if (isScanInProgress) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setIsScanInProgress(false);
            setIsScanTransitioning(true);
            console.log('Stopping Scanning...');
            setList([]);
            BleManager.stopScan().then(() => {
                console.log('Peripheral stopped scanning...');
            }).catch(err => {
                console.error(err);
            });
            setIsScanTransitioning(false);
        } else {
            console.log('This is wrong - it is not scanning ...');
        }
    };

    const handleStopScan = () => {
        console.log(`Scan is stopped. isScanInProgress = ${isScanInProgress}`);
       setIsScanInProgress(false);
    }

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

    const testPeripheral = (peripheral: BtCounterPeripheral) => {
        (async () => {
            const id = peripheral.peripheral.id;
            console.log('testPeripheral ' + id);
            if (peripheral) {
                if (peripheral.connected) {
                    console.log('Disconnecting from ' + id);
                    await stopNotification(id);
                    await BleManager.disconnect(id);
                    peripheral.connected = false;
                    console.log('Disconnected from ' + id);
                } else {
                    try {
                        console.log('Connecting to ' + id);
                        await BleManager.connect(id);
                        await timeout(100);
                        /* Test read current RSSI value */
                        await retrieveServices(id);
                        // await retrieveRssi(id, p);
    
                        await startNotification(id);
                        peripheral.connected = true;
                        console.log('Connected to ' + id);
                    } catch (error) {
                        console.log('Connection error', error);
                    }
                }
                let p = peripherals.get(id);
                if (p) {
                    peripherals.set(id, p);
                    setList(Array.from(peripherals.values()));
                }
            }
        })();
    };

    useEffect(() => {
        (async () => {
            try {
                console.log('BT Counter initialisation ... Started');
                await BleManager.start({ showAlert: false });
        
                const handleDiscoverPeripheral = (peripheral: Peripheral) => {
                    (async () => {
                        if (peripheral.name === 'CC2650 SensorTag') {
                            console.log('Got SensorTag', peripheral);
                            let btPeripheral = { connected: false, peripheral: peripheral } as BtCounterPeripheral;
                            peripherals.set(peripheral.id, btPeripheral);
                            await BleManager.stopScan();
                            setIsScanInProgress(false);
                            setList(Array.from(peripherals.values()));
                        } else {
                            // console.log('Not SensorTag - ignoring');
                        }
                    })();
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
            <TouchableHighlight onPress={() => testPeripheral(item)} key={item.peripheral.id}>
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
                        <View style={{ margin: 10 }}>
                            <Button disabled={isScanTransitioning} color={!isScanInProgress ? '#2196F3' : '#f194ff'}
                                title={!isScanInProgress ? 'Scan Bluetooth' : 'Stop Scanning' }
                                onPress={() => !isScanInProgress ? startScan() : stopScan() }
                            />
                        </View>

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
                        <Button title="Start" onPress={() => { setCollecting(true)}}/>
                    </TouchableHighlight>
                    <TextInput style={{ backgroundColor: "red", flex: 0.5 }}>{nowCount}</TextInput>
                    <TouchableHighlight>
                        <Button title="Stop" onPress={() => setCollecting(false)}/>
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
