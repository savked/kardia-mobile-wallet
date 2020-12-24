import React from 'react';
import {Text, View} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {styles} from './style';
import Button from '../../components/Button';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';

const ImportModal = ({
  onClose,
  onSuccessScan,
}: {
  onClose: () => void;
  onSuccessScan: (e: BarCodeReadEvent) => void;
}) => {
  const language = useRecoilValue(languageAtom);
  return (
    <>
      <View style={styles.qrScannerHeader}>
        <Text style={styles.centerText}>
          {getLanguageString(language, 'SCAN_SEED_PHRASE')}
        </Text>
      </View>
      <QRCodeScanner onRead={onSuccessScan} showMarker={true} />
      <View style={styles.qrScannerFooter}>
        <Button size="large" title="Cancel" onPress={onClose} />
      </View>
    </>
  );
};

export default ImportModal;
