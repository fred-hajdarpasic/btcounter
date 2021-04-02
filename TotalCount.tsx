/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';

import { Text, View } from 'react-native';

export interface TotalCountProps {
    totalCount: number;
}

const TotalCount = (props: TotalCountProps): JSX.Element => {
    return (
        <View>
            <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{ textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow:1}}>
                    Total
                </Text>
                <Text style={{ fontSize: 20, textAlign: 'right', padding: 2, backgroundColor:'white', flexGrow:5}}>
                    {props.totalCount}
                </Text>
            </View>
        </View>
    );
};

export default TotalCount;
