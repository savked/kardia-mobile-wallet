/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Portal from '@burstware/react-native-portal';
import {styles} from './style';
import IconButton from '../IconButton';

const DEFAULT_HEIGHT_MODAL = 0.5;

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
  if (full) {
    endFlex = 0.9;
  } else if (contentStyle && contentStyle.flex) {
    endFlex = contentStyle.flex;
  }

  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: endFlex,
        duration: 170,
        useNativeDriver: false,
      }).start();
    }
  }, [endFlex, slideAnim, visible]);

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
                {flex: slideAnim},
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
