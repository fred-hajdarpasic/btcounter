/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {useState, useCallback} from 'react';
import {View, Button, TouchableHighlight, Text} from 'react-native';

import BleManager from 'react-native-ble-manager';
import * as Progress from 'react-native-progress';

import useNumberMemo from './useNumberMemo';
import useDownCounterWithTimer from './useDownCounterWithTimer';
import Colors from './Colors';

const useScanning = (onStartScan: () => void): [() => void, () => void, () => JSX.Element] => {
    const [isScanInProgress, setIsScanInProgress] = useState(false);
    const [isScanTransitioning, setIsScanTransitioning] = useState(false);
    const [duration, setDuration] = useState(20);
    const [getCountValue, startDownCounter, stopDownCounter] = useDownCounterWithTimer(duration, 1000);

    const [force, setForce] = useState(false);
    React.useEffect(() => {
        let timerid = setInterval(() => {
            setForce(!force);
        }, 500);
        return () => {
            clearInterval(timerid);
        };
    });

    const startScan = useCallback(() => {
        startDownCounter();
        onStartScan();
        setIsScanInProgress(true);
        setIsScanTransitioning(true);
        console.log('Initiating Scanning...');
        BleManager.scan([], duration, true)
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
        stopDownCounter();
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
        stopDownCounter();
    }, []);

    // console.log(`Scanning render ${getCountValue()}`);
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
                        { !isScanTransitioning ? ( !isScanInProgress ? 'SCAN BLUETOOTH' : `STOP SCANNING (${getCountValue()}) (${force ? '.' : '!'})` ) : 'WAIT' }
                    </Text>
                </TouchableHighlight>
                {/* <Progress.Bar progress={(20 - getCountValue()) / 20} width={20} style={{width:'100%'}}/> */}
            </View>
        );
    };

    return [handleStopScan, stopScan, ScanButton];
};

export default useScanning;
