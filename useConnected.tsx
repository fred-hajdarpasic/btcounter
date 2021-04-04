/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text} from 'react-native';

import BleManager from 'react-native-ble-manager';
import Colors from './Colors';
import useMyMemo from './useMyMemo';
import useRefreshTimer from './useRefreshTimer';

const LOW_RSSI_THRESHOLD = -90;

interface ConnectionIndicatorProps {
    connected: boolean;
}

const useConnected = (preipheralId: string): [(props: ConnectionIndicatorProps) => JSX.Element] => {
    const [getRssi, setRssi] = useMyMemo(0);
    const [getBlIsOn, setBlIsOn] = useMyMemo(true);

    const tickFunction = React.useCallback(async () => {
        try {
            await BleManager.enableBluetooth();
            setBlIsOn(true);
            // console.log('BLE is on');
        } catch (error) {
            console.log(`Error: ${error}`);
            setBlIsOn(false);
        }
        if (preipheralId) {
            // console.log('Collecting rssi for peripheral id = ' + preipheralId);
            BleManager.readRSSI(preipheralId)
                .then((data: any) => {
                    // console.log('Current RSSI: ' + typeof data);
                    setRssi(data as number);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preipheralId]);

    useRefreshTimer(20000, tickFunction);

    const ConnectionIndicator = (props: ConnectionIndicatorProps): JSX.Element => {
        const getColor = () => {
            if (props.connected) {
                return getRssi() > LOW_RSSI_THRESHOLD ? Colors.green : Colors.orange;
            } else {
                return getBlIsOn() ? Colors.orange : Colors.red;
            }
        };

        const getTitle = (): string => {
            if (props.connected) {
                return getRssi() > LOW_RSSI_THRESHOLD ? 'SE connected' : `RSSI LOW ${getRssi()}`;
            } else {
                return getBlIsOn() ? 'NOT CONNECTED' : 'BL IS OFF';
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
