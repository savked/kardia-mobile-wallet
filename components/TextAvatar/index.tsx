import React from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import CustomText from '../Text';
import { styles } from './style';

const TextAvatar = ({
  text,
  backgroundColor = '#32a852',
  textColor = '#FFFFFF',
  size = 50,
  style,
  textStyle,
  type = 'circle',
}: TextAvatarProps & {
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  type?: 'circle' | 'square'
}) => {
  const containerStyle = {
    backgroundColor,
    width: size,
    height: size,
    borderRadius: type === 'circle' ? size / 2 : 8,
  };
  const _textStyle = {
    color: textColor,
  };
  return (
    <View style={[styles.containerStyle, containerStyle, style]}>
      <CustomText style={[styles.textStyle, _textStyle, textStyle]}>{text[0]}</CustomText>
    </View>
  );
};

export default TextAvatar;
