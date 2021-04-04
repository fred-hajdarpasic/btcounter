/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, NativeModules, NativeEventEmitter} from 'react-native';

import Colors from './Colors';
import useRefreshTimer from './useRefreshTimer';

import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const LOW_RSSI_THRESHOLD = -90;
interface ConnectionIndicatorProps {
    connected: boolean;
}

const useConnected = (
    preipheralId: string,
    onBleStateChanged: (on: boolean) => void,
): [(props: ConnectionIndicatorProps) => JSX.Element] => {
    const [rssi, setRssi] = React.useState(0);
    const [blIsOn, setBlIsOn] = React.useState(false);

    const tickFunction = React.useCallback(async () => {
        try {
            await BleManager.checkState();
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }, []);

    useRefreshTimer(1000, tickFunction);

    React.useEffect(() => {
        const handleDidUpdateState = (stateData: any) => {
            // console.log('BLE state = ' + JSON.stringify(stateData));
            if (stateData.state === 'on') {
                setBlIsOn(true);
                onBleStateChanged(true);
                if (preipheralId) {
                    // console.log('Collecting rssi for peripheral id = ' + preipheralId);
                    BleManager.readRSSI(preipheralId)
                        .then((rssiData: any) => {
                            console.log('Current RSSI: ' + rssiData);
                            setRssi(rssiData as number);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            } else {
                setBlIsOn(false);
                onBleStateChanged(false);
            }
        };
        bleManagerEmitter.addListener('BleManagerDidUpdateState', handleDidUpdateState);
        return () => {
            bleManagerEmitter.removeListener('BleManagerDidUpdateState', handleDidUpdateState);
        };
    }, [onBleStateChanged, preipheralId]);

    const ConnectionIndicator = (props: ConnectionIndicatorProps): JSX.Element => {
        const getColor = () => {
            if (props.connected) {
                return rssi > LOW_RSSI_THRESHOLD ? Colors.green : Colors.orange;
            } else {
                return blIsOn ? Colors.orange : Colors.red;
            }
        };

        const getTitle = (): string => {
            if (props.connected) {
                return rssi > LOW_RSSI_THRESHOLD ? 'SE connected' : `RSSI LOW ${rssi}`;
            } else {
                return blIsOn ? 'NOT CONNECTED' : 'BL IS OFF';
            }
        };

        return (
            <View>
                <Text
                    style={{
                        height: 40,
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        padding: 2,
                        flexGrow: 1,
                        backgroundColor: getColor(),
                        color: 'white',
                    }}>
                    {getTitle()}
                </Text>
            </View>
        );
    };

    return [ConnectionIndicator];
};

export default useConnected;
