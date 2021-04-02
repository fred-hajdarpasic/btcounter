/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';

import { Button, Text, View } from 'react-native';
import { formatRelative } from 'date-fns';

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
                <Button disabled={true} title={formatRelative(props.date, new Date())} onPress={() => undefined} />
                <Text style={{ fontSize: 20, textAlign: 'right', padding: 2, backgroundColor:'white', flexGrow:5}}>
                    {props.mostRecentCount}
                </Text>
            </View>
        </View>
    );
};

export default MostRecent;
