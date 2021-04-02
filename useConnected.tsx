import React from 'react';
import {View, Button} from 'react-native';

import BleManager from 'react-native-ble-manager';
import Colors from './Colors';
import useMyMemo from './useMyMemo';
import useRefreshTimer from './useRefreshTimer';

const LOW_RSSI_THRESHOLD = -90;

const useConnected = (preipheralId: string): [() => JSX.Element] => {
    const [getRssi, setRssi] = useMyMemo(0);
    const [getColor, setColor] = useMyMemo(Colors.orange);
    const [getBlIsOn, setBlIsOn] = useMyMemo(true);
    const [getIsConnected, setIsConnected] = useMyMemo(false);
    const [getTitle, setTitle] = useMyMemo('not connected');

    const tickFunction = React.useCallback(async () => {
        try {
            await BleManager.enableBluetooth();
            setBlIsOn(true);
            console.log('BLE is on');
        } catch (error) {
            console.log(`Error: ${error}`);
            setBlIsOn(false);
        }
        if (preipheralId) {
            // console.log('Collecting rssi for peripheral id = ' + preipheralId);
            setIsConnected(true);
            setColor(getRssi() > LOW_RSSI_THRESHOLD ? Colors.green : Colors.orange);
            setTitle(getRssi() > LOW_RSSI_THRESHOLD ? 'connected' : `RSSI low ${getRssi()}`);
            BleManager.readRSSI(preipheralId)
                .then((data: any) => {
                    // console.log('Current RSSI: ' + typeof data);
                    setRssi(data as number);
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            setIsConnected(false);
            setColor(getBlIsOn() ? Colors.orange : Colors.red);
            setTitle(getBlIsOn() ? 'not connected' : 'BL is off');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preipheralId]);

    useRefreshTimer(2000, tickFunction);

    const ConnectionIndicator = (): JSX.Element => {
        return (
            <View>
                <Button color={getColor()} title={getTitle()} onPress={() => undefined} />
            </View>
        );
    };
    return [ConnectionIndicator];
};

export default useConnected;
