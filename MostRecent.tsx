/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';

import { Text, View } from 'react-native';
import { formatRelative } from 'date-fns';
import Colors from './Colors';

export interface MostRecentProps {
    mostRecentCount: number;
    date: Date
}

const MostRecent = (props: MostRecentProps): JSX.Element => {
    return (
        <View>
            <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow:1}}>
                    Most Recent
                </Text>
                <Text style={{ textAlign: 'center', textAlignVertical: 'center', padding: 2, backgroundColor: Colors.gray, flexGrow:5,  color: Colors.white} }>
                    {formatRelative(props.date, new Date())}
                </Text>
                <Text style={{ fontSize: 20, textAlign: 'right', padding: 2, backgroundColor:'white', flexGrow:5}}>
                    {props.mostRecentCount}
                </Text>
            </View>
        </View>
    );
};

export default MostRecent;
