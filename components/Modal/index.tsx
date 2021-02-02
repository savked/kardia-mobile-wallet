/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {styles} from './style';
import IconButton from '../IconButton';

const {height: viewportHeight} = Dimensions.get('window');

const CustomModal = ({
  animationType = 'slide',
  visible,
  onClose,
  children,
  full = false,
  showCloseButton = true,
  contentStyle = {
    marginTop: viewportHeight / 2,
  } as StyleProp<ViewStyle>,
}: CustomModalProps & {contentStyle?: StyleProp<ViewStyle>}) => {
  if (!(contentStyle as any).marginTop) {
    (contentStyle as any).marginTop = viewportHeight / 2;
  }
  const [marginTop, setMarginTop] = useState(
    full ? viewportHeight / 12 : (contentStyle as any).marginTop,
  );

  useEffect(() => {
    if (contentStyle && (contentStyle as any).marginTop) {
      setMarginTop((contentStyle as any).marginTop);
    }
  }, [contentStyle]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardWillShow', _keyboardDidShow);
      Keyboard.addListener('keyboardWillHide', _keyboardDidHide);
    } else {
      Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    }

    // cleanup function
    return () => {
      if (Platform.OS === 'ios') {
        Keyboard.removeListener('keyboardWillShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardWillHide', _keyboardDidHide);
      } else {
        Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginTop]);

  const _keyboardDidShow = (e: any) => {
    setMarginTop((contentStyle as any).marginTop - e.endCoordinates.height);
  };

  const _keyboardDidHide = () => {
    setMarginTop(full ? viewportHeight / 12 : (contentStyle as any).marginTop);
  };

  if (!visible) {
    return null;
  }

  return (
    <BlurView blurType="dark" blurAmount={50} style={styles.absolute}>
      <Modal
        animationType={animationType}
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity style={styles.contaner} onPress={onClose}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalView, contentStyle, {marginTop}]}>
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
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </BlurView>
  );
};

export default CustomModal;
