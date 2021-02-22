/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Keyboard, Platform, Text, View} from 'react-native';
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
  onSuccessScan: (e: BarCodeReadEvent, type: string) => void;
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [scanType, setScanType] = useState('mnemonic');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const language = useRecoilValue(languageAtom);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardWillShow', _keyboardDidShow);
      Keyboard.addListener('keyboardWillHide', _keyboardDidHide);
    } else {
      Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    }

    // cleanup function
    return () => {
      if (Platform.OS === 'ios') {
        Keyboard.removeListener('keyboardWillShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardWillHide', _keyboardDidHide);
      } else {
        Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
      }
    };
  }, []);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false);
  };

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
          <Text style={{fontSize: 22}}>
            {getLanguageString(language, 'ENTER_SEED_PHRASE')}
          </Text>
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
          <Text style={{fontSize: 22}}>
            {getLanguageString(language, 'ENTER_PRIVATE_KEY')}
          </Text>
          <CustomTextInput
            style={styles.input}
            value={privateKey}
            onChangeText={setPrivateKey}
            autoCapitalize="none"
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
              type="link"
              size="large"
              textStyle={{color: '#000'}}
              onPress={() => {
                Keyboard.dismiss();
                setScanType('mnemonic');
              }}
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
