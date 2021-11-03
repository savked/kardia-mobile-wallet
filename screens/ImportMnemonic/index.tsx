import { useNavigation, useRoute } from '@react-navigation/native';
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Keyboard, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { statusBarColorAtom } from '../../atoms/statusBar';
import IconButton from '../../components/IconButton';
import CustomText from '../../components/Text';
import { theme } from '../../theme/dark';
import { getLanguageString } from '../../utils/lang';
import { saveAppPasscodeSetting } from '../../utils/local';
import InputMode from './InputMode';
import ScanMode from './ScanMode';
import { styles } from './style';
// import {RNCamera} from 'react-native-camera';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

export default () => {
  const { params } = useRoute();

  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const [mode, setMode] = useState('scan');

  useEffect(() => {
    (async () => {
      const fromNoWallet = params && (params as any).fromNoWallet === true ? true : false;
      if (fromNoWallet) {
        await saveAppPasscodeSetting(false);
      }
    })()
  }, []);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true)
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false)
  };

  useEffect(() => {
    if (mode === 'enter') {
      setStatusBarColor('rgba(28, 28, 40, 0.87)');
    } else {
      setStatusBarColor(theme.backgroundColor)
    }
  }, [mode])

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

  return (
    <View style={styles.container}>
      {mode === 'scan' && <ScanMode />}
      <View
        style={{
          position: 'absolute',
          width: viewportWidth,
          height: viewportHeight,
          justifyContent: 'space-between',
          backgroundColor:
            mode === 'enter' ? 'rgba(28, 28, 40, 0.87)' : 'transparent',
        }}>
        {mode === 'scan' && (
          <Image
            source={require('../../assets/qr_background.png')}
            style={{
              resizeMode: 'cover',
              width: viewportWidth,
              height: viewportHeight,
              position: 'absolute',
            }}
          />
        )}
        <View
          style={{ padding: 20, alignItems: 'flex-end', width: viewportWidth }}>
          <IconButton
            name="close"
            style={styles.closeIcon}
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={{ flex: 1, justifyContent: keyboardShown ? 'flex-start' : 'space-between', marginVertical: 40 }}>
          {mode === 'scan' ? (
            <View
              style={{
                // marginBottom: (viewportHeight - 256) / 2 - 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{ width: 250 }}>
                <CustomText
                  style={{
                    textAlign: 'center',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: 24,
                    marginBottom: 4,
                  }}>
                  {getLanguageString(language, 'SCAN_QR_TITLE')}
                </CustomText>
                <CustomText
                  style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 15 }}>
                  {getLanguageString(language, 'SCAN_QR_MNEMONIC')}
                </CustomText>
              </View>
            </View>
          ) : (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{ width: 320, marginBottom: 24 }}>
                <CustomText
                  style={{
                    textAlign: 'center',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: 24,
                    marginBottom: 4,
                  }}>
                  {getLanguageString(language, 'ENTER_SEED_PHRASE')}
                </CustomText>
                <CustomText
                  style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 15 }}>
                  {getLanguageString(language, 'ENTER_QR_MNEMONIC')}
                </CustomText>
              </View>
              <View style={{ width: 320 }}>
                <InputMode fromNoWallet={params && (params as any).fromNoWallet === true ? true : false} />
              </View>
            </View>
          )}

          <View
            style={{
              backgroundColor: theme.backgroundColor,
              marginHorizontal: 20,
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              onPress={() => setMode('scan')}
              style={{
                flex: 1,
                backgroundColor:
                  mode === 'scan' ? theme.backgroundFocusColor : 'transparent',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <CustomText style={{ color: mode === 'scan' ? theme.textColor : theme.mutedTextColor }}>{getLanguageString(language, 'SCAN_MODE')}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('enter')}
              style={{
                flex: 1,
                backgroundColor:
                  mode === 'enter' ? theme.backgroundFocusColor : 'transparent',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <CustomText style={{ color: mode === 'enter' ? theme.textColor : theme.mutedTextColor }}>{getLanguageString(language, 'INPUT_MODE')}</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
