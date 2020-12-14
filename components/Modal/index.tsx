/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Dimensions, Modal, View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import Button from '../Button';
import {styles} from './style';

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
  return (
    <BlurView blurType="dark" style={styles.absolute}>
      <Modal
        animationType={animationType}
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View
          style={[
            styles.modalView,
            {marginTop: full ? viewportHeight / 20 : viewportHeight / 5},
            full ? {flex: 0.9} : {flex: 0.6},
            contentStyle,
          ]}>
          {children}
          {showCloseButton && (
            <Button size="small" title="Close" onPress={onClose} />
          )}
        </View>
      </Modal>
    </BlurView>
  );
};

export default CustomModal;
