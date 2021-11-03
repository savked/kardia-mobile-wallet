import React, { useContext } from 'react';
import { Platform, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemeContext } from '../../ThemeContext';
import CustomText from '../Text';

export default ({active, content, containerStyle, onPress}: {
  active: boolean;
  content: string;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void
}) => {
  const theme = useContext(ThemeContext)
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: active ? 'transparent' : 'rgba(154, 163, 178, 1)',
        backgroundColor: active ? 'rgba(51, 96, 255, 1)' : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 28
      }, containerStyle]}
    >
      <CustomText 
        style={{
          color: active ? '#FFFFFF' : theme.mutedTextColor, 
          fontSize: theme.defaultFontSize,
          fontWeight: '500',
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
        }}
      >
        {content}
      </CustomText>
    </TouchableOpacity>
  );
}