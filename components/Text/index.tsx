import React from 'react';
import { Text } from 'react-native';

const CustomText = ({children, ...rest}: any) => {
  return (
    <Text {...rest} style={[rest.style, {fontFamily: 'Work Sans'}]}>{children}</Text>
  );
};

export default CustomText;