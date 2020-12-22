import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {styles} from './style';
// import Modal from '../../components/Modal';

const ScanQRAddressModal = ({onClose}: {onClose: () => void}) => {
  const onSuccess = (e: any) => {
    console.log(e.data);
  };
  return (
    <QRCodeScanner
      onRead={onSuccess}
      topContent={
        <Text style={styles.centerText}>
          Go to <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text>{' '}
          your computer and scan the QR code.
        </Text>
      }
      bottomContent={
        <TouchableOpacity style={styles.buttonTouchable} onPress={onClose}>
          <Text style={styles.buttonText}>OK. Got it!</Text>
        </TouchableOpacity>
      }
    />
  );
};

export default ScanQRAddressModal;
