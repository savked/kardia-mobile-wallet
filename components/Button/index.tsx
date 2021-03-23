/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';

const Button = ({
  title,
  style,
  textStyle,
  onPress,
  icon,
  iconName,
  block,
  size = 'medium',
  type = 'primary',
  iconSize = 14,
  iconColor,
  disabled,
  loading = false,
}: ButtonProps) => {
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
      if (textStyle && textStyle.color) {
        _iconColor = textStyle.color;
      }
      if (iconColor) {
        _iconColor = iconColor;
      }
      return (
        <Icon
          style={styles.icon}
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
      <TouchableOpacity
        style={block ? {width: '100%'} : null}
        onPress={() => {
          !loading && onPress();
        }}
        disabled={disabled}>
        <LinearGradient
          start={{x: 0, y: 0}}
          locations={[0, 0.2, 0.4, 0.6, 0.8]}
          end={{x: 1, y: 1}}
          style={[
            styles.button,
            parseSize(),
            typeStyle,
            style,
            block ? {width: '100%'} : null,
          ]}
          colors={[
            'rgba(126, 219, 220, 0.3)',
            'rgba(228, 175, 203, 0.3)',
            'rgba(226, 194, 139, 0.3)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 1)',
          ]}>
          {loading && <ActivityIndicator color={textTypeStyle.color} />}
          {!loading && renderIcon()}
          {!loading && (
            <Text style={[styles.title, textTypeStyle, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
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
        style,
        type === 'link' ? {padding: 0, minWidth: 0} : null,
        block ? {width: '100%'} : null,
      ]}>
      {loading && <ActivityIndicator color={textTypeStyle.color} />}
      {!loading && renderIcon()}
      {/* <Icon name={iconName} size={size} color={color} style={{marginRight:8}}/> */}
      {!loading && (
        <Text style={[styles.title, textTypeStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
