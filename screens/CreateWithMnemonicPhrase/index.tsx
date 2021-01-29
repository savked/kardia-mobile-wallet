/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {styles} from './style';
import Button from '../../components/Button';
import {generateMnemonic, getWalletFromMnemonic} from '../../utils/blockchain';
import AlertModal from '../../components/AlertModal';
import {useRecoilState, useRecoilValue} from 'recoil';
import {walletsAtom} from '../../atoms/wallets';
import {saveMnemonic, saveWallets} from '../../utils/local';
import {ThemeContext} from '../../ThemeContext';
import List from '../../components/List';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';

const CreateWithMnemonicPhrase = () => {
  const theme = useContext(ThemeContext);
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicError, setMnemonicError] = useState('');
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const language = useRecoilValue(languageAtom);

  useEffect(() => {
    const mn = generateMnemonic();
    setMnemonic(mn);
  }, []);

  const handleAccess = async () => {
    setLoading(true);
    setTimeout(async () => {
      const newWallet = await getWalletFromMnemonic(mnemonic.trim());
      if (!newWallet) {
        setMnemonicError('Error happen!');
        return;
      }
      await saveMnemonic(newWallet.address, mnemonic.trim());
      const _wallets: Wallet[] = JSON.parse(JSON.stringify(wallets));
      _wallets.push(newWallet as Wallet);
      await saveWallets(_wallets);
      setLoading(false);
      setWallets(_wallets);
    }, 1);
  };

  const mnemonicArr = mnemonic.split(' ').map((item) => ({
    label: item,
    value: item,
  }));

  const renderWarning = () => {
    switch (language) {
      case 'en_US':
        return (
          <Text
            style={[
              styles.description,
              styles.paragraph,
              {color: theme.textColor},
            ]}>
            Please make sure you
            <Text style={{fontWeight: 'bold'}}> WRITE DOWN</Text> and{' '}
            <Text style={{fontWeight: 'bold'}}>SAVE</Text> your mnemonic phrase.
            You will need it to access or recover your wallet.
          </Text>
        );
      case 'vi_VI':
        return (
          <Text
            style={[
              styles.description,
              styles.paragraph,
              {color: theme.textColor},
            ]}>
            Hãy đảm bảo bạn đã
            <Text style={{fontWeight: 'bold'}}> GHI LẠI</Text> 24 từ này. 24 từ
            này không thể thay đổi và sẽ được sử dụng để truy cập và khôi phục
            ví.
          </Text>
        );
      default:
        return (
          <Text
            style={[
              styles.description,
              styles.paragraph,
              {color: theme.textColor},
            ]}>
            Please make sure you
            <Text style={{fontWeight: 'bold'}}> WRITE DOWN</Text> and{' '}
            <Text style={{fontWeight: 'bold'}}>SAVE</Text> your mnemonic phrase.
            You will need it to access or recover your wallet.
          </Text>
        );
    }
  };

  if (!mnemonic) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ActivityIndicator color={theme.textColor} size={40} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <List
        items={mnemonicArr}
        numColumns={4}
        containerStyle={{
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
        listStyle={{
          maxHeight: 280,
        }}
        render={(item, index) => {
          return (
            <View
              key={index}
              style={[
                styles.phraseItemContainer,
                {backgroundColor: theme.backgroundFocusColor},
              ]}>
              <Text style={[styles.phraseItemText, {color: theme.textColor}]}>
                {item.label}
              </Text>
            </View>
          );
        }}
      />
      <Text
        style={[
          styles.description,
          styles.paragraph,
          {color: theme.textColor},
        ]}>
        {getLanguageString(language, 'MNEMONIC_DESCRIPTION')}
      </Text>
      {renderWarning()}
      <Button
        type="primary"
        disabled={loading}
        title={getLanguageString(language, 'SUBMIT_CREATE')}
        onPress={() => setShowConfirm(true)}
        size="large"
        style={{
          width: '100%',
        }}
      />
      <AlertModal
        type="error"
        visible={mnemonicError !== ''}
        onClose={() => setMnemonicError('')}
        message={mnemonicError}
      />
      <AlertModal
        type="confirm"
        okText={getLanguageString(language, 'SURE')}
        cancelText={getLanguageString(language, 'NOT_SURE')}
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onOK={handleAccess}
        okLoading={loading}
        okDisabled={loading}
        cancelDisabled={loading}
        messageStyle={{textAlign: 'center'}}
        message={getLanguageString(language, 'CONFIRM_ENTER_SEED_PHRASE')}
      />
    </View>
  );
};

export default CreateWithMnemonicPhrase;
