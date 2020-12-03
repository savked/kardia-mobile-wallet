import React from 'react';
import { View } from 'react-native';

export default function Divider({height, color}: DividerProps) {
    return (
        <View style={{
            height: height || 1,
            backgroundColor: color || 'rgba(255, 255, 255 ,0.3)',
            alignSelf: 'stretch',
            marginVertical: 14
        }} />
    )
}