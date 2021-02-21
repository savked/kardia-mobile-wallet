/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  // InteractionManager,
} from 'react-native';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import {useNavigation} from '@react-navigation/native';
import {ethers} from 'ethers';
import {styles} from './style';
import * as Bip39 from 'bip39';
import {walletsAtom} from '../../atoms/wallets';
import {saveMnemonic, saveWallets} from '../../utils/local';
import {useRecoilState, useRecoilValue} from 'recoil';
import CustomTextInput from '../../components/TextInput';
import {ThemeContext} from '../../ThemeContext';
import {languageAtom} from '../../atoms/language';
import {getLanguageString} from '../../utils/lang';
import {SafeAreaView} from 'react-native-safe-area-context';
import SelectWallet from '../Home/SelectWallet';
import {getBalance} from '../../services/account';
import {getStakingAmount} from '../../services/staking';

const ImportMnemonic = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const [mnemonic, setMnemonic] = useState('');
  const [error, setError] = useState('');
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const [loading, setLoading] = useState(false);
  const [selectingWallet, setSelectingWallet] = useState(false);

  const language = useRecoilValue(languageAtom);

  const accessWalletByMnemonic = async () => {
    setLoading(true);
    setError('');
    const valid = validateSeedPhrase();
    if (!valid) {
      setLoading(false);
      return;
    }
    setSelectingWallet(true);
  };

  function validateSeedPhrase() {
    if (!mnemonic.trim()) {
      setError(getLanguageString(language, 'REQUIRED_FIELD'));
      return false;
    }
    const valid = Bip39.validateMnemonic(mnemonic.trim());
    if (!valid) {
      setError(getLanguageString(language, 'ERROR_SEED_PHRASE'));
      return false;
    }
    return true;
  }

  const saveWallet = async (_wallet: Wallet) => {
    const _privateKey = _wallet.privateKey;
    const walletAddress = _wallet.address;
    const balance = await getBalance(walletAddress);
    const staked = await getStakingAmount(walletAddress);

    const wallet: Wallet = {
      privateKey: _privateKey,
      address: walletAddress,
      balance,
      staked,
    };

    await saveMnemonic(
      walletAddress,
      mnemonic !== '' ? mnemonic.trim() : 'FROM_PK',
    );
    const _wallets = JSON.parse(JSON.stringify(wallets));
    _wallets.push(wallet);
    await saveWallets(_wallets);
    setLoading(false);
    setWallets(_wallets);
    setSelectingWallet(false);
    // RNRestart.Restart();
  };

  if (selectingWallet) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
        <SelectWallet
          mnemonic={mnemonic}
          onSelect={saveWallet}
          onCancel={() => {
            setMnemonic('');
            setSelectingWallet(false);
          }}
          // onError={(err) => {
          //   let message = getLanguageString(language, 'GENERAL_ERROR');
          //   if (err.message) {
          //     message = err.message;
          //   }
          //   setScanMessage(message);
          //   setScanType('warning');
          //   setShowScanAlert(true);
          // }}
        />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <Text style={[styles.title, {color: theme.textColor}]}>
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
        <ErrorMessage message={error} style={{textAlign: 'left'}} />
        <View style={styles.buttonGroup}>
          <Button
            loading={loading}
            disabled={loading}
            size="large"
            type="primary"
            title={getLanguageString(language, 'SUBMIT')}
            onPress={accessWalletByMnemonic}
          />
          <Button
            disabled={loading}
            size="large"
            type="secondary"
            onPress={() => navigation.goBack()}
            title={getLanguageString(language, 'GO_BACK')}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ImportMnemonic;
