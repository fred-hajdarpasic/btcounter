/* eslint-disable prettier/prettier */
import React, {useState, useCallback, Dispatch, SetStateAction} from 'react';

import BleManager from 'react-native-ble-manager';
import {Peripheral} from 'react-native-ble-manager';
import RNBeep from 'react-native-a-beep';
import useScanning from './useScanning';
import useInitBle from './useInitBle';
import useNumberMemo from './useNumberMemo';
import useTimer from './useTimer';
import useBooleanMemo from './useBooleanMemo';
import NowCount from './NowCount';

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
    onStartCollecting: () => void,
    onStopCollecting: (nowCount: number) => void,
): [
    any[],
    Dispatch<SetStateAction<any[]>>,
    () => boolean,
    (b: boolean) => void,
    () => boolean,
    (b: boolean) => void,
    (peripheral: BtCounterPeripheral) => void,
    (id: string, p: BtCounterPeripheral | undefined) => Promise<void>,
    () => JSX.Element,
    (props: {disabled: boolean}) => JSX.Element,
] => {
    const peripherals = React.useMemo(() => new Map<string, BtCounterPeripheral>(), []);
    const [list, setList] = useState([] as any[]);
    const [isCollecting, setCollecting] = useBooleanMemo(false);
    const [isPaused, setIsPaused] = useBooleanMemo(false);

    const [getNowCount, setNowCount] = useNumberMemo(0);
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

    const toggleConnection = (peripheral: BtCounterPeripheral) => {
        (async () => {
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
        })();
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

    const handleUpdateValueForCharacteristic = useCallback((data: any) => {
        console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
        if (data.value[0] && isCollecting() && !isPaused()) {
            setNowCount(getNowCount() + 1);
        }
        if (data.value[0] && isCollecting()) {
            RNBeep.beep();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useInitBle(
        handleDiscoverPeripheral,
        handleDisconnectedPeripheral,
        handleUpdateValueForCharacteristic,
        handleStopScan,
    );

    // console.log(`Main screen render getNowCount = ${getNowCount()} isCollecting=${isCollecting()}`);

    React.useEffect(() => {
        if (isCollecting() && !isPaused()) {
            startScreenRefreshTimer();
        } else {
            stopScreenRefreshTimer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCollecting]);

    const NowCountWidget = (props: {disabled: boolean}): JSX.Element => {
        return (
            <NowCount
                started={isCollecting()}
                disabled={props.disabled}
                forceRefresh={force}
                nowCount={getNowCount()}
                onStartCollecting={() => {
                    setNowCount(0);
                    setCollecting(true);
                    onStartCollecting();
                }}
                onStopCollecting={(nowCount: number) => {
                    setCollecting(false);
                    onStopCollecting(nowCount);
                }}
            />
        );
    };

    return [
        list,
        setList,
        isCollecting,
        setCollecting,
        isPaused,
        setIsPaused,
        toggleConnection,
        retrieveRssi,
        ScanButton,
        NowCountWidget,
    ];
};

export default useUiState;
