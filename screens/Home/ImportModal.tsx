/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { BarCodeReadEvent } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { useKeyboardHook } from '../../hooks/isKeyboardShown';
import { getLanguageString } from '../../utils/lang';
import { styles } from './style';

const ImportModal = ({
  onClose,
  onSuccessScan,
  loading = false,
}: {
  onClose: () => void;
  loading?: boolean;
  onSuccessScan: (e: BarCodeReadEvent, type: string) => void;
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [scanType, setScanType] = useState('mnemonic');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const language = useRecoilValue(languageAtom);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false);
  };

  useKeyboardHook(_keyboardDidShow, _keyboardDidHide)

  const getMnemonicModalContentStyle = () => {
    if (Platform.OS === 'android') {
      return {
        justifyContent: 'space-around',
        flex: keyboardShown ? 0.7 : 0.4,
      };
    } else {
      return {
        justifyContent: 'space-around',
        flex: 0.4,
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
      };
    }
  };

  const getPrivateKeyModalContentStyle = () => {
    if (Platform.OS === 'android') {
      return {
        justifyContent: 'space-around',
        flex: keyboardShown ? 0.5 : 0.3,
      };
    } else {
      return {
        justifyContent: 'space-around',
        flex: 0.3,
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
      };
    }
  };

  if (!showScanner) {
    if (scanType === 'mnemonic') {
      return (
        <Modal
          visible={true}
          onClose={onClose}
          showCloseButton={true}
          contentStyle={getMnemonicModalContentStyle() as any}>
          <CustomText style={{fontSize: 22}}>
            {getLanguageString(language, 'ENTER_SEED_PHRASE')}
          </CustomText>
          <CustomTextInput
            style={styles.input}
            value={mnemonic}
            onChangeText={setMnemonic}
            numberOfLines={5}
            multiline={true}
            autoCapitalize="none"
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
              type="link"
              size="large"
              textStyle={{color: '#000'}}
              onPress={() => {
                Keyboard.dismiss();
                setScanType('privatekey');
              }}
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
          contentStyle={getPrivateKeyModalContentStyle() as any}>
          <CustomText style={{fontSize: 22}}>
            {getLanguageString(language, 'ENTER_PRIVATE_KEY')}
          </CustomText>
          <CustomTextInput
            style={styles.input}
            value={privateKey}
            onChangeText={setPrivateKey}
            autoCapitalize="none"
          />
          <Button
            block
            disabled={loading}
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
              disabled={loading}
              loading={loading}
            />
            <Button
              title={getLanguageString(language, 'IMPORT_WITH_SEED')}
              type="link"
              size="large"
              textStyle={{color: '#000'}}
              onPress={() => {
                Keyboard.dismiss();
                setScanType('mnemonic');
              }}
              disabled={loading}
            />
          </View>
        </Modal>
      );
    }
  }

  return (
    <View style={styles.scanContainer}>
      <View style={styles.qrScannerHeader}>
        <CustomText style={styles.centerText}>
          {getLanguageString(
            language,
            scanType === 'mnemonic' ? 'SCAN_SEED_PHRASE' : 'SCAN_PRIVATE_KEY',
          )}
        </CustomText>
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
