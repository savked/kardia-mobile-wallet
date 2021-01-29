/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import List from '../../components/List';
import Button from '../../components/Button';
import {getMnemonic} from '../../utils/local';
import {styles} from './style';
import {copyToClipboard} from '../../utils/string';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';

const MnemonicPhraseSetting = () => {
  const theme = useContext(ThemeContext);
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const language = useRecoilValue(languageAtom);
  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);

  const privateKey = wallets[selectedWallet].privateKey || '';

  useEffect(() => {
    return () => {
      setShowMnemonic(false);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!wallets[selectedWallet] || !wallets[selectedWallet].address) {
        return;
      }
      const mn = await getMnemonic(wallets[selectedWallet].address);
      if (mn !== 'FROM_PK') {
        setMnemonic(mn);
      }
    })();
  }, [selectedWallet, wallets]);

  let mnemonicArr: {label: string; value: string}[] = [];

  if (mnemonic) {
    mnemonicArr = mnemonic.split(' ').map((item) => ({
      label: item,
      value: item,
    }));
  } else {
    mnemonicArr = [
      {
        label: privateKey,
        value: privateKey,
      },
    ];
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {showMnemonic ? (
        <View>
          <List
            items={mnemonicArr}
            numColumns={4}
            containerStyle={{
              justifyContent: 'flex-end',
              alignItems: 'center',
              paddingVertical: 20,
            }}
            listStyle={{
              maxHeight: 390,
            }}
            render={(item, index) => {
              return (
                <View
                  key={index}
                  style={[
                    styles.phraseItemContainer,
                    {backgroundColor: theme.backgroundFocusColor},
                  ]}>
                  <Text
                    style={[styles.phraseItemText, {color: theme.textColor}]}>
                    {item.label}
                  </Text>
                </View>
              );
            }}
          />
          <Button
            title={getLanguageString(language, 'COPY_TO_CLIPBOARD')}
            type="primary"
            onPress={() => copyToClipboard(mnemonic ? mnemonic : privateKey)}
          />
        </View>
      ) : (
        <Button
          size="large"
          title={getLanguageString(language, 'SHOW_SECRET_TEXT')}
          type="primary"
          onPress={() => setShowMnemonic(true)}
          style={{width: '75%'}}
        />
      )}
    </View>
  );
};

export default MnemonicPhraseSetting;
