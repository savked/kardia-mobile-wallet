import React from 'react';
import { Text } from 'react-native';
import {styles} from './style'
const ErrMessage = (props: any) => {
    return !!props.message ? (
        <Text style={styles.text}>{props.message}</Text>
    ) : (<></>)
}

export default ErrMessage;
