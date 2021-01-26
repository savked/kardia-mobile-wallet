/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Dimensions, Text, View} from 'react-native';
import {BarCodeReadEvent} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {styles} from './style';
import Button from '../../components/Button';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Modal from '../../components/Modal';
import CustomTextInput from '../../components/TextInput';

const {height: viewportHeight} = Dimensions.get('window');

const ImportModal = ({
  onClose,
  onSuccessScan,
}: {
  onClose: () => void;
  onSuccessScan: (e: BarCodeReadEvent, type: string) => void;
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [scanType, setScanType] = useState('mnemonic');

  const language = useRecoilValue(languageAtom);

  if (!showScanner) {
    if (scanType === 'mnemonic') {
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
              title={getLanguageString(language, 'IMPORT')}
              type="primary"
              // onPress={() => importMnemonic(mnemonic)}
              onPress={() =>
                mnemonic && onSuccessScan({data: mnemonic} as any, 'mnemonic')
              }
              size="large"
            />
            <Button
              title={getLanguageString(language, 'IMPORT_WITH_PRIVATE_KEY')}
              type="ghost"
              size="large"
              onPress={() => setScanType('privatekey')}
            />
          </View>
        </Modal>
      );
    } else if (scanType === 'privatekey') {
      return (
        <Modal
          visible={true}
          onClose={onClose}
          showCloseButton={true}
          contentStyle={{
            justifyContent: 'space-around',
            marginTop: viewportHeight / 1.7,
          }}>
          <Text style={{fontSize: 22}}>
            {getLanguageString(language, 'ENTER_PRIVATE_KEY')}
          </Text>
          <CustomTextInput
            style={styles.input}
            value={privateKey}
            onChangeText={setPrivateKey}
          />
          <Button
            block
            title={getLanguageString(language, 'SCAN_PRIVATE_KEY')}
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
              title={getLanguageString(language, 'IMPORT')}
              type="primary"
              onPress={() =>
                privateKey &&
                onSuccessScan({data: privateKey} as any, 'privatekey')
              }
              size="large"
            />
            <Button
              title={getLanguageString(language, 'IMPORT_WITH_SEED')}
              type="ghost"
              size="large"
              onPress={() => setScanType('mnemonic')}
            />
          </View>
        </Modal>
      );
    }
  }

  return (
    <View style={styles.scanContainer}>
      <View style={styles.qrScannerHeader}>
        <Text style={styles.centerText}>
          {getLanguageString(
            language,
            scanType === 'mnemonic' ? 'SCAN_SEED_PHRASE' : 'SCAN_PRIVATE_KEY',
          )}
        </Text>
      </View>
      <QRCodeScanner
        onRead={(e) => onSuccessScan(e, scanType)}
        showMarker={true}
      />
      <View style={styles.qrScannerFooter}>
        <Button size="large" title="Cancel" onPress={onClose} />
      </View>
    </View>
  );
};

export default ImportModal;
