/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SafeAreaView, ScrollView, View, Text, StatusBar, FlatList, Button} from 'react-native';

import useUiState from './useUiState';
import useConnected from './useConnected';
import useMyMemo from './useMyMemo';
import {BtCounterPeripheral} from './types';
import {styles} from './styles';
import PeripheralDetails from './PeripheralDetails';
import TotalCount from './TotalCount';
import MostRecent from './MostRecent';
import {subDays} from 'date-fns';
import Pause from './Pause';
import ClearTotalAndHelp from './ClearTotalAndHelp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from './Colors';

const App = () => {
    const [nowCount, setNowCount] = React.useState(0);
    const [totalCount, setTotalCount] = React.useState(10);
    const [mostRecentCount, setMostRecentCount] = React.useState(50);
    const [mostRecentCountDate, setMostRecentCountDate] = React.useState(new Date());
    const [isConnected, setIsConnected] = React.useState(false);

    const [isCollecting, setIsCollecting] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(true);

    const [connectedPeripheralId, setConnectedPeripheralId] = React.useState('');

    const onStartCollecting = React.useCallback(() => {
        console.log('On start collecting called.');
        setIsCollecting(true);
        setIsPaused(false);
        setNowCount(0);
    }, []);

    const onStopCollecting = React.useCallback(() => {
        setIsPaused(true);
        setIsCollecting(false);
        if (nowCount > 0) {
            const newTotalCount: number = totalCount + nowCount;
            const newMostRecentCount = nowCount;
            const newMostRecentCountDate = new Date();

            setTotalCount(newTotalCount);
            setMostRecentCount(newMostRecentCount);
            setMostRecentCountDate(newMostRecentCountDate);

            (async () => {
                await AsyncStorage.setItem('totalCount', `${newTotalCount}`);
                await AsyncStorage.setItem('mostRecentCount', `${newMostRecentCount}`);
                await AsyncStorage.setItem('mostRecentCountDate', `${newMostRecentCountDate}`);
                console.log(
                    `Saved data to async storage newTotalCount = ${newTotalCount}, newMostRecentCount=${newMostRecentCount}, newMostRecentCountDate=${newMostRecentCountDate}`,
                );
            })();
        }
    }, [nowCount, totalCount]);

    const onStartScanning = () => {
        console.log('App: On start scanning');
        setIsCollecting(false);
        setIsPaused(true);
        setIsConnected(false);
        setConnectedPeripheralId('');
    };

    const [list, setList, toggleConnection, retrieveRssi, ScanButton, NowCount] = useUiState(
        isCollecting,
        isPaused,
        nowCount,
        onStartScanning,
        onStartCollecting,
        setNowCount,
        onStopCollecting,
    );
    const [ConnectionIndicator] = useConnected(connectedPeripheralId);
    const renderItem = (peripheral: BtCounterPeripheral) => {
        return (
            <PeripheralDetails
                onPress={async () => {
                    await toggleConnection(peripheral);
                    if (connectedPeripheralId) {
                        setConnectedPeripheralId('');
                    } else {
                        setConnectedPeripheralId(peripheral.peripheral.id);
                    }
                    setIsConnected(peripheral.connected);
                }}
                item={peripheral}
                key={peripheral.peripheral.id}
            />
        );
    };

    React.useEffect(() => {
        (async () => {
            const totalCountFromDb = await AsyncStorage.getItem('totalCount');
            if (totalCountFromDb) {
                console.log(`Read totalCount from storage: ${totalCountFromDb}`);
                setTotalCount(Number.parseFloat(totalCountFromDb));
            } else {
                setTotalCount(0);
            }
            const mostRecentCountFromDb = await AsyncStorage.getItem('mostRecentCount');
            if (mostRecentCountFromDb) {
                console.log(`Read mostRecentCount from storage: ${mostRecentCountFromDb}`);
                setMostRecentCount(Number.parseFloat(mostRecentCountFromDb));
            } else {
                setMostRecentCount(0);
            }
            const mostRecentCountDateFromDb = await AsyncStorage.getItem('mostRecentCountDate');
            if (mostRecentCountDateFromDb) {
                console.log(`Read mostRecentCountDate from storage: ${mostRecentCountDateFromDb}`);
                setMostRecentCountDate(new Date(mostRecentCountDateFromDb));
            } else {
                setMostRecentCountDate(new Date());
            }
        })();
    }, []);

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
                    <View style={styles.body}>
                        <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View style={{flexGrow: 5}}>
                                <ConnectionIndicator connected={isConnected} />
                            </View>
                            <Text style={{textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow: 1}} />
                            <View style={{flexGrow: 5}}>
                                <Text
                                    style={{
                                        height: 20,
                                        textAlign: 'center',
                                        textAlignVertical: 'center',
                                        padding: 2,
                                        flexGrow: 1,
                                        backgroundColor: Colors.lightBlue,
                                        color: 'white',
                                    }}>
                                    Username: ?????
                                </Text>
                            </View>
                        </View>
                        <ScanButton />
                        {list.length === 0 && (
                            <View style={{flex: 1, margin: 20}}>
                                <Text style={{textAlign: 'center'}}>No peripherals</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
                <View style={styles.scrollView}>
                    <FlatList
                        style={{margin: 10}}
                        data={list}
                        renderItem={({item}) => renderItem(item)}
                        keyExtractor={item => item.id}
                    />
                </View>
                <View style={styles.body}>
                    <TotalCount totalCount={totalCount} />
                    <MostRecent mostRecentCount={mostRecentCount} date={mostRecentCountDate} />
                    <NowCount disabled={!isConnected} />
                    <Pause
                        disabled={!isCollecting || !isConnected}
                        paused={isPaused}
                        onPausePressed={() => {
                            setIsPaused(!isPaused);
                        }}
                    />
                    <ClearTotalAndHelp
                        onClearTotalConfirmed={() => {
                            setTotalCount(0);
                        }}
                    />
                </View>
            </SafeAreaView>
        </>
    );
};

export default App;
