import React from 'react';
import { Text } from 'react-native';
import { useRecoilValue } from 'recoil';
import { fontSizeAtom } from '../../atoms/fontSize';

const CustomText = ({children, style, keepFontSize = false, ...rest}: any) => {

  const fontSizeSetting = useRecoilValue(fontSizeAtom)

  let finalStyle: any = {
    fontFamily: 'WorkSans-Regular'
  }

  let finalFontSize = undefined

  if (style) {
    if (Array.isArray(style)) {
      finalStyle = [
        {
          fontFamily: 'WorkSans-Regular'
        },
        ...style,
      ]
      style.forEach((i: any) => {
        if (i && i.fontSize) {
          finalFontSize = i.fontSize
        }
      })
    } else {
      finalStyle = [
        {
          fontFamily: 'WorkSans-Regular'
        },
        style
      ]
      if (style.fontSize) {
        finalFontSize = style.fontSize
      }
    }
  }

  if (finalFontSize && !keepFontSize) {
    if (Array.isArray(finalStyle)) {
      finalStyle.push({fontSize: fontSizeSetting === 'small' ? finalFontSize : finalFontSize * 1.2})
    } else {
      finalStyle.fontSize = fontSizeSetting === 'small' ? finalFontSize : finalFontSize * 1.2
    }
  }



  return (
    <Text allowFontScaling={false} {...rest} style={finalStyle}>{children}</Text>
  );
};

export default CustomText;