import React, {useState, useCallback, Dispatch, SetStateAction} from 'react';

import BleManager from 'react-native-ble-manager';
import {Peripheral} from 'react-native-ble-manager';
import RNBeep from 'react-native-a-beep';
import useScanning from './useScanning';
import useInitBle from './useInitBle';
import useTimer from './useTimer';
import NowCount from './NowCount';
import useBleHandleValueForCharacteristic from './useBleHandleValueForCharacteristic';

interface BtCounterPeripheral {
    peripheral: Peripheral;
    connected: boolean;
}

const timeout = (ms: number): Promise<void> => {
    return new Promise(resolve => {
        console.log(`Initiating timeout of ${ms} msec.`);
        setTimeout(resolve, ms);
    });
};

const PERIPHERAL_NAME_TO_SEARCH = 'CC2650 SensorTag';
const NOTIFY_SERVICE_ID = 'FFE0';
const NOTIFY_CHARACTERISTIC_ID = 'FFE1';
const useUiState = (
    isCollecting: boolean,
    isPaused: boolean,
    nowCount: number,
    onStartScanning: () => void,
    onStartCollecting: () => void,
    setNowCount: (count: number) => void,
    onStopCollecting: () => void,
): [
    any[],
    Dispatch<SetStateAction<any[]>>,
    (peripheral: BtCounterPeripheral) => void,
    (id: string, p: BtCounterPeripheral | undefined) => Promise<void>,
    () => JSX.Element,
    (props: {disabled: boolean}) => JSX.Element,
] => {
    const peripherals = React.useMemo(() => new Map<string, BtCounterPeripheral>(), []);
    const [list, setList] = useState([] as any[]);

    const [force, setForce] = useState(false);
    const [startScreenRefreshTimer, stopScreenRefreshTimer] = useTimer(1000, () => {
        setForce(!force);
    });

    const retrieveServices = async (id: string) => {
        let peripheralData = await BleManager.retrieveServices(id);
        console.log('Retrieved peripheral services', JSON.stringify(peripheralData));
    };

    const retrieveRssi = async (id: string, p: BtCounterPeripheral | undefined): Promise<void> => {
        let rssi = await BleManager.readRSSI(id);
        console.log('Retrieved actual RSSI value', rssi);
        p = peripherals.get(id);
        if (p) {
            p.peripheral.rssi = Number.parseFloat('' + rssi);
            peripherals.set(id, p);
            setList(Array.from(peripherals.values()));
        }
    };

    const startNotification = async (id: string) => {
        try {
            await BleManager.startNotification(id, NOTIFY_SERVICE_ID, NOTIFY_CHARACTERISTIC_ID);
            console.log('Notification started');
        } catch (error) {
            console.log(error);
        }
    };

    const stopNotification = async (id: string) => {
        try {
            await BleManager.stopNotification(id, NOTIFY_SERVICE_ID, NOTIFY_CHARACTERISTIC_ID);
            console.log('Notification stopped');
        } catch (error) {
            console.log(error);
        }
    };

    const connect = async (peripheral: BtCounterPeripheral) => {
        const id = peripheral.peripheral.id;
        console.log('Connecting to ' + id);
        await BleManager.connect(id);
        console.log('Connected to ' + id);
        await timeout(100);
        /* Test read current RSSI value */
        console.log('Getting services for ' + id);
        await retrieveServices(id);
        // await retrieveRssi(id, p);
        console.log('Got services for ' + id);

        console.log('Start notification for ' + id);
        await startNotification(id);
        peripheral.connected = true;
        console.log('Connected to ' + id);
    };

    const disconnect = async (peripheral: BtCounterPeripheral) => {
        const id = peripheral.peripheral.id;
        console.log('Disconnecting from ' + id);
        await stopNotification(id);
        await BleManager.disconnect(id);
        peripheral.connected = false;
        console.log('Disconnected from ' + id);
    };

    const toggleConnection = async (peripheral: BtCounterPeripheral) => {
        const id = peripheral.peripheral.id;
        console.log(`peripheral = ${JSON.stringify(peripheral)}`);
        if (peripheral) {
            if (peripheral.connected) {
                await disconnect(peripheral);
            } else {
                await connect(peripheral);
            }
            let p = peripherals.get(id);
            if (p) {
                peripherals.set(id, p);
                setList(Array.from(peripherals.values()));
            }
        }
    };

    const onStartScan = useCallback(() => {
        (async () => {
            peripherals.forEach(async peripheral => {
                if (peripheral.connected) {
                    await disconnect(peripheral);
                }
            });
            peripherals.clear();
            setList([]);
        })();
        onStartScanning();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [handleStopScan, stopScan, ScanButton] = useScanning(onStartScan);

    const handleDiscoverPeripheral = useCallback((peripheral: Peripheral) => {
        if (peripheral.name === PERIPHERAL_NAME_TO_SEARCH) {
            if (!peripherals.get(peripheral.id)) {
                console.log(`Got First SensorTag, peripheral: ${JSON.stringify(peripheral)}`);
                console.log(`Adding SensorTag: ${peripheral.id}`);
                let btPeripheral = {
                    connected: false,
                    peripheral: peripheral,
                } as BtCounterPeripheral;
                peripherals.set(peripheral.id, btPeripheral);
                stopScan();
                setList(Array.from(peripherals.values()));
            } else {
                // console.log(`SensorTag: id = ${peripheral.id} already in the list.`);
            }
        } else {
            // console.log('Not SensorTag - ignoring');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDisconnectedPeripheral = useCallback((data: any) => {
        let peripheral = peripherals.get(data.peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
        console.log('Disconnected from ' + data.peripheral);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateValueForCharacteristic = useCallback(
        (data: any) => {
            console.log(
                'Received data from ' + data.peripheral + ' characteristic ' + data.characteristic,
                data.value + 'isCollecting' + isCollecting + 'isPaused' + isPaused,
            );
            if (data.value[0] && isCollecting && !isPaused) {
                console.log('INCREMENT');
                setNowCount(nowCount + 1);
            }
            if (data.value[0] && isCollecting) {
                RNBeep.beep();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isCollecting, isPaused, nowCount],
    );

    useInitBle(handleDiscoverPeripheral, handleDisconnectedPeripheral, handleStopScan);
    useBleHandleValueForCharacteristic(handleUpdateValueForCharacteristic);

    // console.log(`Main screen render getNowCount = ${getNowCount()} isCollecting=${isCollecting()}`);

    React.useEffect(() => {
        if (isCollecting && !isPaused) {
            startScreenRefreshTimer();
        } else {
            stopScreenRefreshTimer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCollecting]);

    const NowCountWidget = (props: {disabled: boolean}): JSX.Element => {
        return (
            <NowCount
                started={isCollecting}
                disabled={props.disabled}
                forceRefresh={force}
                nowCount={nowCount}
                onStartCollecting={() => {
                    onStartCollecting();
                }}
                onStopCollecting={() => {
                    onStopCollecting();
                }}
            />
        );
    };

    return [list, setList, toggleConnection, retrieveRssi, ScanButton, NowCountWidget];
};

export default useUiState;
