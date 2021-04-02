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
import {AsyncStorage} from 'react-native';

const App = () => {
    const [totalCount, setTotalCount] = React.useState(10);
    const [mostRecentCount, setMostRecentCount] = React.useState(50);
    const [mostRecentCountDate, setMostRecentCountDate] = React.useState(new Date());
    const [isConnected, setIsCOnnected] = React.useState(false);

    const [getSelectedPeripheralId, setSelectedPeripheralId] = useMyMemo('');

    const onStartCollecting = React.useCallback(() => {
        setIsPaused(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onStopCollecting = React.useCallback(
        (nowCount: number) => {
            const newTotalCount: number = totalCount + nowCount;
            console.log(`newTotalCount = ${newTotalCount}, nowCount=${nowCount}`);
            setTotalCount(newTotalCount);
            setMostRecentCount(nowCount);
            setMostRecentCountDate(new Date());
            setIsPaused(false);

            (async () => {
                await AsyncStorage.setItem('totalCount', `${newTotalCount}`);
                await AsyncStorage.setItem('mostRecentCount', `${mostRecentCount}`);
                await AsyncStorage.setItem('mostRecentCountDate', `${mostRecentCountDate}`);
            })();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [totalCount],
    );

    const [
        list,
        setList,
        isCollecting,
        setCollecting,
        isPaused,
        setIsPaused,
        retrieveConnected,
        toggleConnection,
        retrieveRssi,
        ScanButton,
        NowCount,
    ] = useUiState(onStartCollecting, onStopCollecting);
    const [ConnectionIndicator] = useConnected(getSelectedPeripheralId());
    const renderItem = (peripheral: BtCounterPeripheral) => {
        return (
            <PeripheralDetails
                onPress={() => {
                    if (getSelectedPeripheralId()) {
                        setSelectedPeripheralId('');
                    } else {
                        setSelectedPeripheralId(peripheral.peripheral.id);
                    }
                    toggleConnection(peripheral);
                    setIsCOnnected(!peripheral.connected);
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
                        <ConnectionIndicator />
                        <ScanButton />
                        <View style={{margin: 10}}>
                            <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()} />
                        </View>
                        {list.length === 0 && (
                            <View style={{flex: 1, margin: 20}}>
                                <Text style={{textAlign: 'center'}}>No peripherals</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
                <FlatList data={list} renderItem={({item}) => renderItem(item)} keyExtractor={item => item.id} />
            </SafeAreaView>
            <SafeAreaView>
                <View style={styles.body}>
                    <TotalCount totalCount={totalCount} />
                    <MostRecent mostRecentCount={mostRecentCount} date={mostRecentCountDate} />
                    <NowCount disabled={!isConnected} />
                    <Pause
                        disabled={!isCollecting() || !isConnected}
                        paused={isPaused()}
                        onPausePressed={() => {
                            setIsPaused(!isPaused());
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
