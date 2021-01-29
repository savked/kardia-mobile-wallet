import React from 'react';
import {StyleProp, Text, TextStyle, View, ViewStyle} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {styles} from './style';
import Modal from '../Modal';
import Button from '../Button';

const getIcon = (type: string, iconSize = 140) => {
  switch (type) {
    case 'success':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'check-circle'}
          size={iconSize}
          color="green"
        />
      );
    case 'warning':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'alert-triangle'}
          size={iconSize}
          color="#F8BC87"
        />
      );
    case 'error':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'x-circle'}
          size={iconSize}
          color="red"
        />
      );
    case 'confirm':
      return (
        <FeatherIcon
          style={styles.iconContainer}
          name={'help-circle'}
          size={iconSize}
          color="#868a83"
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
      contentStyle={[styles.modalContent, modalStyle]}>
      {getIcon(type, iconSize)}
      {children}
      {!children && (
        <Text style={[styles.messageContent, messageStyle]}>{message}</Text>
      )}
      {type === 'confirm' && (
        <View style={styles.buttonGroup}>
          <Button
            title={cancelText}
            type="secondary"
            onPress={onClose}
            loading={cancelLoading}
            disabled={cancelDisabled}
          />
          <Button
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
