/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import * as Bip39 from 'bip39';
import React from 'react';
import { Alert, Dimensions } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { getLanguageString } from '../../utils/lang';

export default () => {
  const language = useRecoilValue(languageAtom);
  const navigation = useNavigation();

  const handleImport = (mnemonic: string) => {
    const valid = Bip39.validateMnemonic(mnemonic.trim());
    if (!valid) {
      Alert.alert(getLanguageString(language, 'INVALID_PHRASE'));
      return;
    }
    navigation.navigate('SelectWallet', {
      mnemonic: mnemonic.trim(),
      // 'display advice bean return exact whisper twelve segment eight elegant arrest cat',
    });
  };

  return (
    <QRCodeScanner
      onRead={(e) => {
        handleImport(e.data);
      }}
      // flashMode={RNCamera.Constants.FlashMode.torch}
      topViewStyle={{height: 0}}
      bottomViewStyle={{height: 10}}
      cameraStyle={{height: Dimensions.get('window').height}}
    />
  );
};
