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

const App = () => {
    const [totalCount, setTotalCount] = React.useState(5000);
    const [mostRecentCount, setMostRecentCount] = React.useState(50);
    const [mostRecentCountDate, setMostRecentCountDate] = React.useState(new Date());

    const [getSelectedPeripheralId, setSelectedPeripheralId] = useMyMemo('');

    const onStopCollecting = React.useCallback((nowCount: number) => {
        console.log(`nowCount=${nowCount}`);
        setTotalCount(totalCount + nowCount);
        setMostRecentCount(nowCount);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    ] = useUiState(onStopCollecting);
    const [ConnectionIndicator] = useConnected(getSelectedPeripheralId());
    const renderItem = (item: BtCounterPeripheral) => {
        return (
            <PeripheralDetails
                onPress={() => {
                    if (getSelectedPeripheralId()) {
                        setSelectedPeripheralId('');
                    } else {
                        setSelectedPeripheralId(item.peripheral.id);
                    }
                    toggleConnection(item);
                }}
                item={item}
                key={item.peripheral.id}
            />
        );
    };

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
                    <NowCount />
                    <Pause
                        disabled={!isCollecting()}
                        paused={isPaused()}
                        onPausePressed={() => {
                            setIsPaused(!isPaused());
                        }}
                    />
                </View>
            </SafeAreaView>
        </>
    );
};

export default App;
