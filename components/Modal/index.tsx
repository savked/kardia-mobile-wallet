/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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
  contentStyle,
}: CustomModalProps) => {
  const [marginTop, setMarginTop] = useState(
    full ? viewportHeight / 12 : viewportHeight / 2,
  );

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _keyboardDidShow = (e: any) => {
    setMarginTop(viewportHeight - e.endCoordinates.height - 400);
  };

  const _keyboardDidHide = () => {
    setMarginTop(full ? viewportHeight / 12 : viewportHeight / 2);
  };

  return (
    <BlurView blurType="dark" blurAmount={50} style={styles.absolute}>
      <Modal
        animationType={animationType}
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity style={styles.contaner} onPress={onClose}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalView, {marginTop}, contentStyle]}>
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
