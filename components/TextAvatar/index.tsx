import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './style';

const TextAvatar = ({
  text,
  backgroundColor = '#32a852',
  textColor = '#FFFFFF',
  size = 50,
}: TextAvatarProps) => {
  const containerStyle = {
    backgroundColor,
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  const textStyle = {
    color: textColor,
  };
  return (
    <View style={[styles.containerStyle, containerStyle]}>
      <Text style={[styles.textStyle, textStyle]}>{text[0]}</Text>
    </View>
  );
};

export default TextAvatar;
