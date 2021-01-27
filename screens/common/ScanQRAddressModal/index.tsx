/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import Button from '../../../components/Button';
import {getLanguageString} from '../../../utils/lang';
import {styles} from './style';
import Portal from '@burstware/react-native-portal';

const ScanQRAddressModal = ({
  visible,
  onClose,
  onScanned,
}: {
  visible: boolean;
  onClose: () => void;
  onScanned: (address: string) => void;
}) => {
  const language = useRecoilValue(languageAtom);
  if (!visible) {
    return null;
  }
  return (
    <Portal>
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
        }}>
        <View style={styles.qrScannerHeader}>
          <Text style={styles.centerText}>
            {getLanguageString(language, 'SCAN_QR_FOR_ADDRESS')}
          </Text>
        </View>
        <QRCodeScanner
          onRead={(e) => {
            onScanned(e.data);
          }}
          showMarker={true}
        />
        <View style={styles.qrScannerFooter}>
          <Button size="large" title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Portal>
  );
};

export default ScanQRAddressModal;
