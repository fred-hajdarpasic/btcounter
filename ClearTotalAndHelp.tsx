/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import {Alert, Button, Linking, Text, TouchableHighlight, View} from 'react-native';
import Colors from './Colors';

export interface ClearTotalAndHelpProps {
    onClearTotalConfirmed: () => void;
}

const ClearTotalAndHelp = (props: ClearTotalAndHelpProps): JSX.Element => {
    return (
        <View>
            <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableHighlight style={{flexGrow: 5}}>
                    <Button
                        color={Colors.yellow}
                        title="Clear Total"
                        onPress={() => {
                            Alert.alert('Clear History', 'Please confirm that you want to clear histpry?', [
                                {
                                    text: 'Cancel',
                                    onPress: () => console.log('Cancel Pressed'),
                                    style: 'cancel',
                                },
                                {text: 'OK', onPress: () => props.onClearTotalConfirmed()},
                            ]);
                        }}
                    />
                </TouchableHighlight>
                <Text style={{textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow: 1}} />
                <TouchableHighlight style={{flexGrow: 5}}>
                    <Text
                        style={{
                            height: 35,
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            color: 'black',
                            backgroundColor: Colors.lightGreen,
                        }}
                        onPress={() => Linking.openURL('https://www.google.com')}>
                        Help
                    </Text>
                </TouchableHighlight>
            </View>
        </View>
    );
};

export default ClearTotalAndHelp;
