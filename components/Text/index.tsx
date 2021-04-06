import React from 'react';
import { Text } from 'react-native';

const CustomText = (props: any) => {
  return (
    <Text {...props} style={[props.style, {fontFamily: 'Cochin'}]}></Text>
  );
};

export default CustomText;