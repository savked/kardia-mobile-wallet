/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Dimensions,
  Modal,
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
}: CustomModalProps & {
  contentStyle?: StyleProp<ViewStyle>;
}) => {
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
            <View
              style={[
                styles.modalView,
                {flex: full ? 0.9 : undefined},
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
