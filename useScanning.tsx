/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {useState, useCallback} from 'react';
import {View, TouchableHighlight, Text} from 'react-native';

import BleManager from 'react-native-ble-manager';
import * as Progress from 'react-native-progress';

import Colors from './Colors';

const SCAN_DURATION = 20;
const useScanning = (onStartScan: () => void): [() => void, () => void, () => JSX.Element] => {
    const [isScanInProgress, setIsScanInProgress] = useState(false);
    const [isScanTransitioning, setIsScanTransitioning] = useState(false);
    const [countValue, setCountValue] = React.useState(SCAN_DURATION);

    React.useEffect(() => {
        let timerid = setInterval(() => {
            setCountValue( (countValue > 0) ? countValue - 1 : 0);
        }, 1000);
        return () => {
            clearInterval(timerid);
        };
    });

    const startScan = useCallback(() => {
        setCountValue(20);
        onStartScan();
        setIsScanInProgress(true);
        setIsScanTransitioning(true);
        console.log('Initiating Scanning...');
        BleManager.scan([], SCAN_DURATION, true)
            .then(() => {
                console.log('Peripheral started scanning...');
                setIsScanTransitioning(false);
            })
            .catch(err => {
                setIsScanTransitioning(false);
                console.error(err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopScan = useCallback(() => {
        setCountValue(0);
        setIsScanInProgress(false);
        setIsScanTransitioning(true);
        console.log('Stopping Scanning...');
        BleManager.stopScan()
            .then(() => {
                console.log('Peripheral stopped scanning...');
                setIsScanTransitioning(false);
            })
            .catch(err => {
                setIsScanTransitioning(false);
                console.error(err);
            });
    }, []);

    const handleStopScan = useCallback(() => {
        console.log('Stopped scanning');
        setIsScanInProgress(false);
        setCountValue(0);
    }, []);

    const ScanButton = (): JSX.Element => {
        return (
            <View style={{margin: 10}}>
                <TouchableHighlight onPress={() => (!isScanInProgress ? startScan() : stopScan())}>
                    <Text
                        style={{
                            height: 60,
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            padding: 2,
                            flexGrow: 1,
                            backgroundColor: `${!isScanInProgress ? Colors.blue : Colors.pink}`,
                            color: 'white',
                        }}>
                        { !isScanTransitioning ? ( !isScanInProgress ? 'SCAN BLUETOOTH' : `STOP SCANNING (${countValue})` ) : 'WAIT' }
                    </Text>
                </TouchableHighlight>
                {/* <Progress.Bar progress={(20 - countValue / 20} width={20} style={{width:'100%'}}/> */}
            </View>
        );
    };

    return [handleStopScan, stopScan, ScanButton];
};

export default useScanning;
