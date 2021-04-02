/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';

import { Button, Text, TouchableHighlight, View } from 'react-native';

export interface NowCountProps {
    forceRefresh: boolean;
    onStartCollecting: () => void;
    onStopCollecting: (nowCount: number) => void;
    nowCount: number;
    started: boolean;
}

const NowCount = (props: NowCountProps): JSX.Element => {
    return (
        <View>
            <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow:1}}>
                    Now
                </Text>
                <Text style={{ fontSize: 20, textAlign: 'right', padding: 2, backgroundColor:'white', flexGrow:5}}>
                    {props.nowCount}
                </Text>
            </View>
            <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableHighlight style={{flexGrow:5}}>
                    <Button disabled={props.started}
                        title={`Start ${props.forceRefresh ? '<' : '>'}`}
                        onPress={() => {
                            props.onStartCollecting();
                        }}
                    />
                </TouchableHighlight>
                <Text style={{ textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow:1}} />
                <TouchableHighlight style={{flexGrow:5}}>
                    <Button disabled={!props.started} title="Stop" onPress={() => {
                        props.onStopCollecting(props.nowCount);
                    }} />
                </TouchableHighlight>
            </View>
        </View>
    );
};

export default NowCount;
