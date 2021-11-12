/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import * as Bip39 from 'bip39';
import React, { createRef, useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,

    TextInput as RNTextInput,
    View
} from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { theme } from '../../theme/dark';
import { getLanguageString } from '../../utils/lang';
import { styles } from './style';

export default ({fromNoWallet = false}: {fromNoWallet?: boolean}) => {

  const [mnemonic, setMnemonic] = useState<string[]>(Array(12).fill(''));
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
    <View style={{width: '100%'}}>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
        }}>
        {mnemonic.slice(0, 4).map((word, index) => {
          return (
            <View
              style={{
                width: 80,
                margin: 6,
              }}
              key={`word-${index}`}
            >
              <TextInput
                autoCapitalize="none"
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
              />
            </View>
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
            <View
              style={{
                width: 80,
                margin: 6,
              }}
              key={`word-${index + 4}`}
            >
              <TextInput
                autoCapitalize="none"
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
              />
            </View>
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
            <View
              style={{
                width: 80,
                margin: 6,
              }}
              key={`word-${index + 8}`}
            >
              <TextInput
                autoCapitalize="none"
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
              />
            </View>
          );
        })}
      </View>
      <Button
        style={{marginTop: 42, marginBottom: 12}}
        title={getLanguageString(language, 'IMPORT')}
        onPress={handleImport}
      />
    </View>
  );
};
