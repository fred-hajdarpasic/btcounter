/* eslint-disable eslint-comments/no-unused-disable */
/* eslint-disable no-trailing-spaces */
/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    NativeModules,
    NativeEventEmitter,
    Button,
    Platform,
    PermissionsAndroid,
    FlatList,
    TouchableHighlight,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import BleManager from 'react-native-ble-manager';
import { Peripheral } from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

interface BtCounterPeripheral {
    peripheral: Peripheral;
    connected: boolean;
}

const App = () => {
    const [isScanning, setIsScanning] = useState(false);
    const peripherals = new Map<string, BtCounterPeripheral>();
    const [list, setList] = useState([] as any[]);


    const startScan = () => {
        if (!isScanning) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                console.log('Start Scanning...');
                BleManager.scan([], 3, true).then((results) => {
                console.log('Scanning...');
                setIsScanning(true);
            }).catch(err => {
                console.error(err);
            });
        }
    }

    const handleStopScan = () => {
        console.log('Scan is stopped');
        setIsScanning(false);
    }

    const handleDisconnectedPeripheral = (data: any) => {
        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
        console.log('Disconnected from ' + data.peripheral);
    }

    const handleUpdateValueForCharacteristic = (data: any) => {
        console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    }

    const retrieveConnected = () => {
        BleManager.getConnectedPeripherals([]).then((results) => {
            if (results.length == 0) {
                console.log('No connected peripherals')
            }
            console.log(results);
            for (var i = 0; i < results.length; i++) {
                let peripheral = results[i] as Peripheral;
                let connected = true;
                let btCounterPeripheral = {peripheral, connected} as BtCounterPeripheral;


                peripherals.set(peripheral.id, btCounterPeripheral);
                setList(Array.from(peripherals.values()));
            }
        });
    }

    const handleDiscoverPeripheral = (peripheral: Peripheral) => {
        console.log('Got ble peripheral', peripheral);
        if (peripheral.name === 'CC2650 SensorTag') {
            let btPeripheral = {connected: false, peripheral: peripheral} as BtCounterPeripheral;
            peripherals.set(peripheral.id, btPeripheral);
            setList(Array.from(peripherals.values()));
        }
    };

    const testPeripheral = (peripheral: BtCounterPeripheral) => {
        const id = peripheral.peripheral.id;
        if (peripheral) {
            if (peripheral.connected) {
                BleManager.disconnect(id);
            } else {
                BleManager.connect(id).then(() => {
                    let p = peripherals.get(id);
                    if (p) {
                        p.connected = true;
                        peripherals.set(id, p);
                        setList(Array.from(peripherals.values()));
                    }
                    console.log('Connected to ' + id);


                    setTimeout(() => {

                        /* Test read current RSSI value */
                        BleManager.retrieveServices(id).then((peripheralData) => {
                            console.log('Retrieved peripheral services', peripheralData);

                            BleManager.readRSSI(id).then((rssi) => {
                                console.log('Retrieved actual RSSI value', rssi);
                                let p = peripherals.get(id);
                                if (p) {
                                    p.peripheral.rssi = Number.parseFloat("" + rssi);
                                    peripherals.set(id, p);
                                    setList(Array.from(peripherals.values()));
                                }
                            });
                        });

                        // Test using bleno's pizza example
                        // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
                        /*
                        BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                          console.log(peripheralInfo);
                          var service = '13333333-3333-3333-3333-333333333337';
                          var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
                          var crustCharacteristic = '13333333-3333-3333-3333-333333330001';
            
                          setTimeout(() => {
                            BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                              console.log('Started notification on ' + peripheral.id);
                              setTimeout(() => {
                                BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                                  console.log('Writed NORMAL crust');
                                  BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                                    console.log('Writed 351 temperature, the pizza should be BAKED');
                                    
                                    //var PizzaBakeResult = {
                                    //  HALF_BAKED: 0,
                                    //  BAKED:      1,
                                    //  CRISPY:     2,
                                    //  BURNT:      3,
                                    //  ON_FIRE:    4
                                    //};
                                  });
                                });
            
                              }, 500);
                            }).catch((error) => {
                              console.log('Notification error', error);
                            });
                          }, 200);
                        });*/



                    }, 900);
                }).catch((error) => {
                    console.log('Connection error', error);
                });
            }
        }

    }

    useEffect(() => {
        console.log('start');
        BleManager.start({ showAlert: false });

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
        console.log('unmount');

        return (() => {
            bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
            bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
        })
    }, []);

    const renderItem = (item: BtCounterPeripheral) => {
        console.log(`item=${JSON.stringify(item)}`);
        const color = item.connected ? 'green' : '#fff';
        return (
            <TouchableHighlight onPress={() => testPeripheral(item)}>
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
                            <Button
                                title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}
                                onPress={() => startScan()}
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
