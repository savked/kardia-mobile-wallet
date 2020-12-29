/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {styles} from './style';
import Button from '../../components/Button';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Modal from '../../components/Modal';
import CustomTextInput from '../../components/TextInput';

const ImportModal = ({
  onClose,
  onSuccessScan,
}: {
  onClose: () => void;
  onSuccessScan: (e: BarCodeReadEvent) => void;
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [mnemonic, setMnemonic] = useState('');

  const language = useRecoilValue(languageAtom);

  if (!showScanner) {
    return (
      <Modal
        visible={true}
        onClose={onClose}
        showCloseButton={true}
        contentStyle={{justifyContent: 'space-around'}}>
        <Text style={{fontSize: 22}}>
          {getLanguageString(language, 'ENTER_SEED_PHRASE')}
        </Text>
        <CustomTextInput
          style={styles.input}
          value={mnemonic}
          onChangeText={setMnemonic}
          numberOfLines={5}
          multiline={true}
        />
        <Button
          block
          title={getLanguageString(language, 'SCAN_SEED_PHRASE')}
          type="secondary"
          iconName="qrcode"
          onPress={() => setShowScanner(true)}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <Button
            block
            title={getLanguageString(language, 'IMPORT')}
            type="primary"
            onPress={onClose}
            size="large"
          />
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.scanContainer}>
      <View style={styles.qrScannerHeader}>
        <Text style={styles.centerText}>
          {getLanguageString(language, 'SCAN_SEED_PHRASE')}
        </Text>
      </View>
      <QRCodeScanner onRead={onSuccessScan} showMarker={true} />
      <View style={styles.qrScannerFooter}>
        <Button size="large" title="Cancel" onPress={onClose} />
      </View>
    </View>
  );
};

export default ImportModal;
