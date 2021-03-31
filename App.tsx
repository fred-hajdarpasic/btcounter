/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, FlatList, TouchableHighlight, TextInput, Button } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import { Peripheral } from 'react-native-ble-manager';
import useUiState from './useUiState';

interface BtCounterPeripheral {
    peripheral: Peripheral;
    connected: boolean;
}

const App = () => {
    const [list, setList, isCollecting, setCollecting, retrieveConnected, toggleConnection, retrieveRssi, ScanButton, NowCount] = useUiState();

    const renderItem = (item: BtCounterPeripheral) => {
        // console.log(`item=${JSON.stringify(item)}`);
        const color = item.connected ? 'green' : '#fff';
        return (
            <TouchableHighlight onPress={() => toggleConnection(item)} key={item.peripheral.id}>
                <View style={[styles.row, { backgroundColor: color }]}>
                    <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{item.peripheral.name}</Text>
                    <Text style={{ fontSize: 10, textAlign: 'center', color: '#333333', padding: 2 }}>RSSI: {item.peripheral.rssi}</Text>
                    <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20 }}>{item.peripheral.id}</Text>
                </View>
            </TouchableHighlight>
        );
    };

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}>
                    <View style={styles.body}>
                        <ScanButton />

                        <View style={{ margin: 10 }}>
                            <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()} />
                        </View>

                        {(list.length === 0) &&
                            <View style={{ flex: 1, margin: 20 }}>
                                <Text style={{ textAlign: 'center' }}>No peripherals</Text>
                            </View>
                        }

                    </View>
                </ScrollView>
                <FlatList
                    data={list}
                    renderItem={({ item }) => renderItem(item)}
                    keyExtractor={item => item.id}
                />
                <NowCount />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
});

export default App;
