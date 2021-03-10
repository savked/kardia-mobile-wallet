import React from 'react';
import Modal from '../../../components/Modal';
import {Text} from 'react-native';

const NewTokenModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Text>123</Text>
    </Modal>
  );
};

export default NewTokenModal;
