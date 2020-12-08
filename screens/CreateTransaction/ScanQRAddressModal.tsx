import React from 'react';
import {Text} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Modal from '../../components/Modal';

const ScanQRAddressModal = ({onClose}: {onClose: () => void}) => {
  const onSuccess = (e: any) => {
    console.log(e.data);
  };
  return (
    <Modal showCloseButton={false} visible={true} onClose={onClose}>
      <Text>Scan QR Code</Text>
      <QRCodeScanner onRead={onSuccess} />
    </Modal>
  );
};

export default ScanQRAddressModal;
