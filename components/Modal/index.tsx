/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  Dimensions
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Portal from '@burstware/react-native-portal';
import {styles} from './style';
import IconButton from '../IconButton';

const {height: viewportHeight} = Dimensions.get('window')

const DEFAULT_HEIGHT_MODAL = 0.5;
const DEFAULT_HEIGHT_MODAL_IN_PIXEL = viewportHeight / 2;

const CustomModal = ({
  // animationType = 'slide',
  visible,
  onClose,
  children,
  full = false,
  showCloseButton = true,
  contentStyle = {
    flex: DEFAULT_HEIGHT_MODAL,
  } as StyleProp<ViewStyle>,
}: CustomModalProps & {
  contentStyle?: any;
}) => {
  let endFlex = DEFAULT_HEIGHT_MODAL;
  let endHeight = DEFAULT_HEIGHT_MODAL_IN_PIXEL;
  if (full) {
    endFlex = 0.9;
    endHeight = 11 * viewportHeight / 12
  } else if (contentStyle && contentStyle.flex) {
    endFlex = contentStyle.flex;
  } else if (contentStyle && contentStyle.height) {
    endHeight = contentStyle.height
  }

  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let endValue = endFlex
    if (contentStyle && contentStyle.height) {
      console.log('use height')
      endValue = endHeight
    } 
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: endValue,
        duration: 170,
        useNativeDriver: false,
      }).start();
    }
  }, [endFlex, endHeight, slideAnim, visible]);

  const getAnimationStyle = () => {
    if (contentStyle && contentStyle.height) {
      return {height: slideAnim}
    }
    return {flex: slideAnim}
  };

  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <BlurView blurType="dark" blurAmount={50} style={styles.absolute}>
        <TouchableOpacity style={styles.container} onPress={onClose}>
          <TouchableWithoutFeedback onPress={() => {}}>
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
                />
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </BlurView>
    </Portal>
  );
};

export default CustomModal;
