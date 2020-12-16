import React from 'react';
import {Text} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Modal from '../../components/Modal';

const ImportModal = ({
  onClose,
  onSuccessScan,
}: {
  onClose: () => void;
  onSuccessScan: (e: BarCodeReadEvent) => void;
}) => {
  return (
    <Modal showCloseButton={false} visible={true} onClose={onClose}>
      <Text>Scan QR Code for Private key</Text>
      <QRCodeScanner onRead={onSuccessScan} />
    </Modal>
  );
};

export default ImportModal;
