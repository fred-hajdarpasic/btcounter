/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { View, Button } from 'react-native';

import BleManager from 'react-native-ble-manager';

const useScanning = (onStartScan: () => void): [() => void, () => void, () => JSX.Element] => {
    const [isScanInProgress, setIsScanInProgress] = useState(false);
    const [isScanTransitioning, setIsScanTransitioning] = useState(false);
    const [duration, setDuration] = useState(20);
    const [counter, setCounter] = useState(20);

    const startScan = useCallback(() => {
        onStartScan();
        setIsScanInProgress(true);
        setIsScanTransitioning(true);
        setCounter(duration);
        console.log('Initiating Scanning...');
        BleManager.scan([], duration, true).then(() => {
            console.log('Peripheral started scanning...');
            setIsScanTransitioning(false);
        }).catch(err => {
            setIsScanTransitioning(false);
            console.error(err);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const stopScan = useCallback(() => {
        setIsScanInProgress(false);
        setIsScanTransitioning(true);
        console.log('Stopping Scanning...');
        BleManager.stopScan().then(() => {
            console.log('Peripheral stopped scanning...');
            setIsScanTransitioning(false);
        }).catch(err => {
            setIsScanTransitioning(false);
            console.error(err);
        });
      }, []);

    const handleStopScan = useCallback(() => {
        console.log('Stopped scanning');
        setIsScanInProgress(false);
    },[]);

    React.useEffect(() => {
//        console.log('Init timer.');
        let timerid = setInterval(() => {
            if (counter > 0) {
                setCounter(counter - 1);
            }
        }, 1000);
        return () => {
            // console.log('Cleanup');
            clearInterval(timerid);
        };
    });

    const ScanButton = (): JSX.Element => {
        return <View style={{ margin: 10 }}>
            <Button disabled={isScanTransitioning} color={!isScanInProgress ? '#2196F3' : '#f194ff'}
                title={!isScanInProgress ? 'Scan Bluetooth' : `Stop Scanning (${counter})`}
                onPress={() => !isScanInProgress ? startScan() : stopScan()}
            />
        </View>;
    };


    return [handleStopScan, stopScan, ScanButton];
};

export default useScanning;
