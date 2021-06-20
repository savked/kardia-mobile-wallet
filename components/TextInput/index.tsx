/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {TextInput, View, Text, StyleProp, TextStyle, ViewStyle, ActivityIndicator, TextInputKeyPressEventData, NativeSyntheticEvent, TextInputSubmitEditingEventData} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ThemeContext} from '../../ThemeContext';
import { mergeObjArr } from '../../utils/object';
import CustomText from '../Text';
import {styles} from './style';

const CustomTextInput = ({
  onChangeText,
  onBlur,
  onFocus,
  value,
  iconName,
  onIconPress,
  headline,
  multiline = false,
  numberOfLines = 5,
  editable = true,
  placeholder,
  block,
  icons,
  message = '',
  keyboardType = 'default',
  headlineStyle,
  autoCapitalize = 'sentences',
  inputStyle,
  placeholderTextColor,
  inputRef,
  containerStyle,
  autoFocus,
  loading = false,
  onKeyPress,
  onSubmitEditing,
  autoCompleteType,
  autoCorrect
}: CustomTextInputProps & {
  headlineStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  inputRef?: React.RefObject<TextInput>;
  autoFocus?: boolean;
  loading?: boolean;
  onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  autoCompleteType?: string;
  autoCorrect?: boolean
}) => {
  const theme = useContext(ThemeContext);

  const renderMessage = () => {
    if (!message) {
      return;
    }
    if (typeof message === 'string') {
      return <CustomText style={styles.errorMessage}>{message}</CustomText>;
    }
    return message();
  };

  const calculatedStyle = mergeObjArr([
    styles.input,
    multiline ? styles.multiline : null,
    // block ? {width: '100%'} : null,
    inputStyle,
  ])

  return (
    <>
      {headline && (
        <CustomText
          style={[styles.headline, {color: theme.textColor}, headlineStyle]}>
          {headline}
        </CustomText>
      )}
      <View
        style={[
          {flexDirection: 'row', alignItems: 'center'},
          block ? {width: '100%'} : null,
          containerStyle,
        ]}>
        <TextInput
          autoCorrect={autoCorrect}
          autoCompleteType={autoCompleteType as any}
          allowFontScaling={false}
          onKeyPress={onKeyPress}
          onSubmitEditing={onSubmitEditing}
          style={calculatedStyle}
          ref={inputRef}
          keyboardType={keyboardType as any}
          onChangeText={onChangeText}
          value={loading ? '' : value}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable && loading === false}
          placeholder={placeholder}
          onBlur={onBlur}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          placeholderTextColor={placeholderTextColor}
          autoFocus={autoFocus}
          keyboardAppearance="dark"
        />
        {
          loading && (
            <View style={{position: 'absolute', left: calculatedStyle.paddingLeft || calculatedStyle.paddingHorizontal}}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            </View>
          )
        }
        {iconName && (
          <Icon
            onPress={onIconPress}
            name={iconName}
            size={25}
            color={'black'}
            style={styles.textIcon}
          />
        )}
        {icons && icons()}
      </View>
      {renderMessage()}
    </>
  );
};

export default CustomTextInput;
