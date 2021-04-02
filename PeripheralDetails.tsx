/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import {
    View,
    Text,
    TouchableHighlight,
} from 'react-native';

import { BtCounterPeripheral } from './types';
import { styles } from './styles';
import Colors from './Colors';

interface PeripheralDetailsProps {
    item: BtCounterPeripheral;
    onPress: () => void
}

const PeripheralDetails = (props: PeripheralDetailsProps) => {
    // console.log(`item=${JSON.stringify(item)}`);
    const color = props.item.connected ? Colors.lightGreen : Colors.purple;
    return (
        <TouchableHighlight
            onPress={props.onPress}
            key={props.item.peripheral.id}>
            <View style={[styles.row, {backgroundColor: color}]}>
                <Text
                    style={{
                        fontSize: 12,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 10,
                    }}>
                    {props.item.peripheral.name}
                </Text>
                <Text
                    style={{
                        fontSize: 10,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 2,
                    }}>
                    RSSI: {props.item.peripheral.rssi}
                </Text>
                <Text
                    style={{
                        fontSize: 8,
                        textAlign: 'center',
                        color: '#333333',
                        padding: 2,
                        paddingBottom: 20,
                    }}>
                    {props.item.peripheral.id}
                </Text>
            </View>
        </TouchableHighlight>
    );
};

export default PeripheralDetails;
