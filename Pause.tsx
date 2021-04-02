/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import {Button, Text, TouchableHighlight, View} from 'react-native';
import Colors from './Colors';

export interface PauseProps {
    paused: boolean;
    disabled: boolean;
    onPausePressed: () => void;
}

const Pause = (props: PauseProps): JSX.Element => {
    return (
        <View>
            <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow: 4}} />
                <TouchableHighlight style={{flexGrow: 2}}>
                    <Button
                        color={Colors.orange}
                        disabled={props.disabled}
                        title={props.paused ? 'Resume' : 'Pause'}
                        onPress={() => {
                            props.onPausePressed();
                        }}
                    />
                </TouchableHighlight>
                <Text style={{textAlign: 'left', textAlignVertical: 'center', padding: 2, flexGrow: 4}} />
            </View>
        </View>
    );
};

export default Pause;
