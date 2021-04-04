import {useEffect} from 'react';
import {NativeModules, NativeEventEmitter} from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const useBleHandleValueForCharacteristic = (handleUpdateValueForCharacteristic: (data: any) => void) => {
    useEffect(() => {
        (async () => {
            console.log('BleManagerDidUpdateValueForCharacteristic ... Started');

            bleManagerEmitter.addListener(
                'BleManagerDidUpdateValueForCharacteristic',
                handleUpdateValueForCharacteristic,
            );

            console.log('BleManagerDidUpdateValueForCharacteristic ... Completed');
        })();
        return () => {
            console.log('BleManagerDidUpdateValueForCharacteristic cleanup');
            bleManagerEmitter.removeListener(
                'BleManagerDidUpdateValueForCharacteristic',
                handleUpdateValueForCharacteristic,
            );
        };
    }, [handleUpdateValueForCharacteristic]);
};

export default useBleHandleValueForCharacteristic;
