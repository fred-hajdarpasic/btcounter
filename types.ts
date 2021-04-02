import {Peripheral} from 'react-native-ble-manager';

export interface BtCounterPeripheral {
    peripheral: Peripheral;
    connected: boolean;
}
