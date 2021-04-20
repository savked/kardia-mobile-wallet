/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleProp, Text, TextStyle, View, ViewStyle} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {styles} from './style';
import Modal from '../Modal';
import Button from '../Button';
import CustomText from '../Text';

const getIcon = (type: string, iconSize = 140, color?: string) => {
  switch (type) {
    case 'success':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'check-circle'}
          size={iconSize}
          color={color || 'green'}
        />
      );
    case 'warning':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'alert-triangle'}
          size={iconSize}
          color={color || '#F8BC87'}
        />
      );
    case 'error':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'x-circle'}
          size={iconSize}
          color={color || 'red'}
        />
      );
    case 'confirm':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'help-circle'}
          size={iconSize}
          color={color || '#868a83'}
        />
      );
    default:
      return null;
  }
};

const AlertModal = ({
  visible,
  onClose,
  message,
  type,
  children,
  onOK = () => {},
  cancelText = 'Cancel',
  okText = 'OK',
  iconSize,
  iconColor,
  messageStyle,
  modalStyle,
  okLoading,
  okDisabled,
  cancelLoading,
  cancelDisabled,
}: AlertModal & {
  messageStyle?: StyleProp<TextStyle>;
  modalStyle?: StyleProp<ViewStyle>;
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={type === 'confirm' ? false : true}
      contentStyle={{...styles.modalContent, ...(modalStyle as any)}}>
      {getIcon(type, iconSize, iconColor)}
      {children}
      {!children && (
        <CustomText  style={[styles.messageContent, messageStyle]}>{message}</CustomText>
      )}
      {type === 'confirm' && (
        <View style={styles.buttonGroup}>
          <Button
            title={cancelText}
            type="outline"
            onPress={onClose}
            loading={cancelLoading}
            disabled={cancelDisabled}
            style={{marginBottom: 8}}
          />
          <Button
            type="primary"
            title={okText}
            onPress={onOK}
            loading={okLoading}
            disabled={okDisabled}
          />
        </View>
      )}
    </Modal>
  );
};

export default AlertModal;
