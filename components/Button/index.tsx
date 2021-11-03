/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react';
import {
    ActivityIndicator,
    StyleProp,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ThemeContext } from '../../ThemeContext';
import CustomText from '../Text';
import { styles } from './style';

const Button = ({
  title,
  style,
  onPress,
  icon,
  iconName,
  textStyle,
  block,
  size = 'medium',
  type = 'primary',
  iconSize = 14,
  iconColor,
  disabled,
  loading = false,
  loadingColor,
}: ButtonProps & {
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}) => {
  const theme = useContext(ThemeContext);

  const parseSize = () => {
    let sizeStyle = styles.mediumButton;
    if (size === 'small') {
      sizeStyle = styles.smallButton;
    } else if (size === 'large') {
      sizeStyle = styles.largeButton;
    }
    return sizeStyle;
  };

  const parseType = () => {
    let typeStyle = {
      ...styles.primaryButton,
      ...{backgroundColor: theme.primaryColor},
    };
    let textTypeStyle = {
      ...styles.primaryButtonText,
      ...{color: theme.primaryTextColor},
    };
    if (type === 'secondary') {
      typeStyle = styles.secondaryButton;
      textTypeStyle = styles.secondaryButtonText;
    } else if (type === 'outline') {
      typeStyle = {
        ...styles.outlineButton,
        ...{borderColor: theme.outlineBorderColor},
      };
      textTypeStyle = {
        ...styles.outlineButtonText,
        ...{color: theme.outlineTextColor},
      };
    } else if (type === 'ghost') {
      typeStyle = {
        ...styles.ghostButton,
        ...{backgroundColor: theme.ghostColor},
      };
      textTypeStyle = {
        ...styles.ghostButtonText,
        ...{color: theme.ghostTextColor},
      };
    } else if (type === 'link') {
      typeStyle = styles.linkButton;
      textTypeStyle = {
        ...styles.linkButtonText,
        ...{color: theme.linkTextColor},
      };
    }

    return {typeStyle, textTypeStyle};
  };

  const renderIcon = () => {
    if (icon) {
      return icon;
    }
    if (iconName) {
      let _iconColor = '#000000';
      switch (type) {
        case 'secondary':
          _iconColor = '#AD182A';
          break;
        case 'outline':
          _iconColor = '#000000';
          break;
        case 'ghost':
          _iconColor = '#364766';
          break;
        default:
          break;
      }
      if (textStyle && (textStyle as any).color) {
        _iconColor = (textStyle as any).color;
      }
      if (iconColor) {
        _iconColor = iconColor;
      }
      return (
        <Icon
          style={[
            styles.icon,
            title ? {marginRight: styles.icon.marginRight} : {marginRight: 0},
          ]}
          name={iconName}
          color={_iconColor}
          size={iconSize}
        />
      );
    }
    return null;
  };

  const {typeStyle, textTypeStyle} = parseType();

  if (type === 'primary') {
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        locations={[0, 0.2, 0.4, 0.6, 0.8]}
        end={{x: 1, y: 1}}
        // style={{flex: 1}}
        style={[
          styles.button,
          
          typeStyle,
          block ? {width: '100%'} : null,
          style,
        ]}
        colors={[
          'rgba(126, 219, 220, 0.3)',
          'rgba(228, 175, 203, 0.3)',
          'rgba(226, 194, 139, 0.3)',
          'rgba(255, 255, 255, 0.3)',
          'rgba(255, 255, 255, 1)',
        ]}>
        <TouchableOpacity
          onPress={() => {
            !loading && onPress();
          }}
          disabled={disabled}
          style={[parseSize(),{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            flexDirection: 'row',
          }]}>
          {loading && <ActivityIndicator color={textTypeStyle.color} />}
          {!loading && renderIcon()}
          {!loading && title && (
            <CustomText style={[styles.title, textTypeStyle, textStyle || {}]}>
              {title}
            </CustomText>
          )}
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => {
        !loading && onPress();
      }}
      disabled={disabled}
      style={[
        styles.button,
        parseSize(),
        typeStyle,
        type === 'link' ? {padding: 0, minWidth: 0} : null,
        block ? {width: '100%'} : null,
        style,
      ]}>
      {loading && <ActivityIndicator color={loadingColor || textTypeStyle.color} />}
      {!loading && renderIcon()}
      {/* <Icon name={iconName} size={size} color={color} style={{marginRight:8}}/> */}
      {!loading && title && (
        <CustomText style={[styles.title, textTypeStyle, textStyle || {}]}>{title}</CustomText>
      )}
    </TouchableOpacity>
  );
};

export default Button;
