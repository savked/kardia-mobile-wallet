/* eslint-disable react-native/no-inline-styles */
import React, {createRef, useEffect, useState} from 'react';
import * as Bip39 from 'bip39';
import {
  Alert,
  Keyboard,
  Platform,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import {styles} from './style';
import TextInput from '../../components/TextInput';
import {theme} from '../../theme/dark';
import Button from '../../components/Button';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {useNavigation} from '@react-navigation/native';

export default ({fromNoWallet = false}: {fromNoWallet?: boolean}) => {

  const [mnemonic, setMnemonic] = useState<string[]>(Array(12).fill(''));
  const [keyboardShown, setKeyboardShown] = useState(false);
  // const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [elRefs, setElRefs] = useState<React.RefObject<RNTextInput>[]>([]);

  const language = useRecoilValue(languageAtom);
  const navigation = useNavigation();

  useEffect(() => {
    // add or remove refs
    setElRefs((_elRefs) =>
      Array(12)
        .fill(0)
        .map((_, i) => _elRefs[i] || createRef()),
    );
  }, []);

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

  const _keyboardDidShow = () => {
    // setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    // setKeyboardOffset(0);
    setKeyboardShown(false);
  };

  const updateMnemonic = (newText: string, index: number) => {
    if (newText.includes(' ')) {
      if (index < 11) {
        if (elRefs[index + 1] && elRefs[index + 1].current) {
          elRefs[index + 1].current!.focus();
        }
        return;
      } else {
        Keyboard.dismiss();
      }
    } else {
      const newMnemonic: string[] = JSON.parse(JSON.stringify(mnemonic));
      newMnemonic[index] = newText;
      setMnemonic(newMnemonic);
    }
  };

  const handleImport = () => {
    const emptyExists = mnemonic.some((item) => item === '');
    if (emptyExists) {
      Alert.alert(getLanguageString(language, 'INVALID_PHRASE'));
      return;
    }
    const valid = Bip39.validateMnemonic(mnemonic.join(' '));
    if (!valid) {
      Alert.alert(getLanguageString(language, 'INVALID_PHRASE'));
      return;
    }
    navigation.navigate('SelectWallet', {
      mnemonic: mnemonic.join(' ').toLowerCase(),
      fromNoWallet
      // 'display advice bean return exact whisper twelve segment eight elegant arrest cat',
    });
  };

  return (
    <View style={{width: '100%', marginBottom: keyboardShown ? 130 : 0}}>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
        }}>
        {mnemonic.slice(0, 4).map((word, index) => {
          return (
            <TextInput
              autoCapitalize="none"
              key={`word-${index}`}
              value={word}
              onChangeText={(newText) => {
                updateMnemonic(newText, index + 0);
              }}
              inputRef={elRefs[index + 0]}
              inputStyle={{
                ...styles.mnemonicInput,
                ...{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  fontSize: 15,
                },
              }}
              containerStyle={{
                minWidth: 80,
                margin: 6,
              }}
            />
          );
        })}
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
        }}>
        {mnemonic.slice(4, 8).map((word, index) => {
          return (
            <TextInput
              autoCapitalize="none"
              key={`word-${index}`}
              value={word}
              onChangeText={(newText) => {
                updateMnemonic(newText, index + 4);
              }}
              inputRef={elRefs[index + 4]}
              inputStyle={{
                ...styles.mnemonicInput,
                ...{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  fontSize: 15,
                },
              }}
              containerStyle={{
                minWidth: 80,
                margin: 6,
              }}
            />
          );
        })}
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
        }}>
        {mnemonic.slice(8, 12).map((word, index) => {
          return (
            <TextInput
              autoCapitalize="none"
              key={`word-${index}`}
              value={word}
              onChangeText={(newText) => {
                updateMnemonic(newText, index + 8);
              }}
              inputRef={elRefs[index + 8]}
              inputStyle={{
                ...styles.mnemonicInput,
                ...{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  fontSize: 15,
                },
              }}
              containerStyle={{
                minWidth: 80,
                margin: 6,
              }}
            />
          );
        })}
      </View>
      <Button
        style={{marginTop: 12}}
        title={getLanguageString(language, 'IMPORT')}
        onPress={handleImport}
      />
    </View>
  );
};
