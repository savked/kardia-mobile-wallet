import React from 'react';
import { Text } from 'react-native';

const CustomText = ({children, ...rest}: any) => {
  // console.log(rest.style)
  let finalStyle: any = {
    fontFamily: 'WorkSans-Regular'
  }

  if (rest.style) {
    if (Array.isArray(rest.style)) {
      finalStyle = [
        {
          fontFamily: 'WorkSans-Regular'
        },
        ...rest.style,
      ]
    } else {
      finalStyle = [
        {
          fontFamily: 'WorkSans-Regular'
        },
        rest.style
      ]
    }
  }

  return (
    <Text {...rest} style={finalStyle}>{children}</Text>
  );
};

export default CustomText;