/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, Button } from 'react-native';

import BleManager from 'react-native-ble-manager';

const useScanning = (onStartScan: () => void): [() => void, () => void, () => void, () => JSX.Element] => {
    const [isScanInProgress, setIsScanInProgress] = useState(false);
    const [isScanTransitioning, setIsScanTransitioning] = useState(false);

    const startScan = () => {
        onStartScan();
        setIsScanInProgress(true);
        setIsScanTransitioning(true);
        console.log('Initiating Scanning...');
        BleManager.scan([], 20, true).then(() => {
            console.log('Peripheral started scanning...');
            setIsScanTransitioning(false);
        }).catch(err => {
            setIsScanTransitioning(false);
            console.error(err);
        });
    };

    const stopScan = () => {
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
    };

    const handleStopScan = () => {
        console.log(`Scan is stopped. isScanInProgress = ${isScanInProgress}`);
        setIsScanInProgress(false);
    };

    useEffect(() => {
        (async () => {
            try {
            } catch (error) {
            }
        })();
    }, []);

    const ScanButton = (): JSX.Element => {
        return <View style={{ margin: 10 }}>
            <Button disabled={isScanTransitioning} color={!isScanInProgress ? '#2196F3' : '#f194ff'}
                title={!isScanInProgress ? 'Scan Bluetooth' : 'Stop Scanning'}
                onPress={() => !isScanInProgress ? startScan() : stopScan()}
            />
        </View>;
    };

    return [handleStopScan, startScan, stopScan, ScanButton];
};

export default useScanning;
