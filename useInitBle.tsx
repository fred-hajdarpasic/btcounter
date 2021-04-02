/* eslint-disable prettier/prettier */
import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

import BleManager from 'react-native-ble-manager';
import { Peripheral } from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const useInitBle = (
    handleDiscoverPeripheral: (peripheral: Peripheral) => void,
    handleDisconnectedPeripheral: (data: any) => void,
    handleUpdateValueForCharacteristic: (data: any) => void,
    handleStopScan: () => void) => {

    useEffect(() => {
        (async () => {
            console.log('BT Counter initialisation ... Started');
            await BleManager.start({ showAlert: true });

            bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
            bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

            if (Platform.OS === 'android' && Platform.Version >= 23) {
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((checkPermissionResult) => {
                    if (checkPermissionResult) {
                        console.log('Permission is OK');
                    } else {
                        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((requestPermissionResult) => {
                            if (requestPermissionResult) {
                                console.log('User accept');
                            } else {
                                console.log('User refuse');
                            }
                        });
                    }
                });
            }
            console.log('BT Counter initialisation ... Completed');
        })();
        return (() => {
            console.log('BT listener cleanup');
            bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
            bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
        });
    }, [handleDiscoverPeripheral, handleDisconnectedPeripheral, handleUpdateValueForCharacteristic, handleStopScan]);
};

export default useInitBle;
