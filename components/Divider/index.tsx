/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

export default function Divider({
  height,
  color,
  style,
}: DividerProps & {style?: StyleProp<ViewStyle>}) {
  return (
    <View
      style={[
        {
          height: height || 1,
          backgroundColor: color || 'rgba(255, 255, 255 ,0.3)',
          // alignSelf: 'stretch',
          marginVertical: 14,
        },
        style,
      ]}
    />
  );
}
