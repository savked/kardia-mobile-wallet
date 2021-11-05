/* eslint-disable react-native/no-inline-styles */
import Portal from '@burstware/react-native-portal';
import { BlurView } from '@react-native-community/blur';
import React, { useContext, useEffect, useRef } from 'react';
import {
    Animated,






    BackHandler, Dimensions,


    Keyboard, StyleProp,
    TouchableOpacity,
    TouchableWithoutFeedback,


    View, ViewStyle
} from 'react-native';
import useIsKeyboardShown from '../../hooks/isKeyboardShown';
import { ThemeContext } from '../../ThemeContext';
import IconButton from '../IconButton';
import { styles } from './style';

const {height: viewportHeight} = Dimensions.get('window');

const DEFAULT_HEIGHT_MODAL = 0.5;
const DEFAULT_HEIGHT_MODAL_IN_PIXEL = viewportHeight / 2;

const CustomModal = ({
  animationType = 'slide',
  visible,
  onClose,
  children,
  full = false,
  showCloseButton = true,
  contentStyle = {
    height: DEFAULT_HEIGHT_MODAL_IN_PIXEL,
  } as StyleProp<ViewStyle>,
}: CustomModalProps & {
  contentStyle?: any;
}) => {
  const keyboardShown = useIsKeyboardShown()
  const theme = useContext(ThemeContext);
  // let endFlex = DEFAULT_HEIGHT_MODAL;
  let endHeight = DEFAULT_HEIGHT_MODAL_IN_PIXEL;
  if (full) {
    // endFlex = 0.9;
    endHeight = (11 * viewportHeight) / 12;
  } else if (contentStyle && contentStyle.flex) {
    // endFlex = contentStyle.flex;
  } else if (contentStyle && contentStyle.height) {
    endHeight = contentStyle.height;
  }

  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let endValue = endHeight;
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: endValue,
        duration: 170,
        useNativeDriver: false,
      }).start();
    }
  }, [contentStyle, endHeight, slideAnim, visible]);

  const getAnimationStyle = () => {
    return {height: slideAnim};
  };

  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose();
        return true;
      } else {
        return false;
      }
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [visible])

  if (!visible) {
    return null;
  }

  const renderContent = () => {
    if (animationType === 'none') {
      return (
        <View style={[
          styles.modalView,
          // {flex: full ? 0.9 : undefined},
          contentStyle,
        ]}>
          {children}
          {showCloseButton && (
            <IconButton
              onPress={onClose}
              name="close"
              size={24}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
              }}
              color={theme.textColor}
            />
          )}
        </View>
      );
    } else {
      return (
        <Animated.View
          style={[
            styles.modalView,
            // {flex: full ? 0.9 : undefined},
            contentStyle,
            getAnimationStyle(),
          ]}>
          {children}
          {showCloseButton && (
            <IconButton
              onPress={onClose}
              name="close"
              size={24}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
              }}
              color={theme.textColor}
            />
          )}
        </Animated.View>
      );
    }
  }

  return (
    <Portal>
      <BlurView blurType="dark" blurAmount={50} style={styles.absolute}>
        <TouchableOpacity style={styles.container} onPress={() => {
          if (keyboardShown) {
            Keyboard.dismiss()
          } else {
            onClose()
          }
        }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            {renderContent()}
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </BlurView>
    </Portal>
  );
};

export default CustomModal;
