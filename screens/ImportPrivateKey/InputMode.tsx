/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Alert, Keyboard, Platform, View} from 'react-native';
import TextInput from '../../components/TextInput';
import {theme} from '../../theme/dark';
import Button from '../../components/Button';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {getWalletFromPK} from '../../utils/blockchain';
import {getBalance} from '../../services/account';
import {getStakingAmount} from '../../services/staking';
import {
  getWallets,
  saveMnemonic,
  saveSelectedWallet,
  saveWallets,
} from '../../utils/local';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {useNavigation} from '@react-navigation/native';

export default () => {
  const navigation = useNavigation();
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  // const [keyboardOffset, setKeyboardOffset] = useState(0);

  const language = useRecoilValue(languageAtom);

  const setWallets = useSetRecoilState(walletsAtom);
  const setSelectedWallet = useSetRecoilState(selectedWalletAtom);

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

  const importPrivateKey = async () => {
    setLoading(true)
    let _privateKey = privateKey;
    if (!_privateKey.includes('0x')) {
      _privateKey = '0x' + _privateKey;
    }

    try {
      const _wallet = getWalletFromPK(_privateKey.trim());
      const walletAddress = _wallet.getChecksumAddressString();
      const balance = await getBalance(walletAddress);
      const staked = await getStakingAmount(walletAddress);
      const wallets = await getWallets();
      const wallet: Wallet = {
        privateKey: _privateKey.trim(),
        address: walletAddress,
        balance,
        staked,
      };

      const walletExisted = wallets
        .map((item) => item.address)
        .includes(wallet.address);

      if (walletExisted) {
        Alert.alert(getLanguageString(language, 'WALLET_EXISTED'));
        setLoading(false);
        return;
      }
      await saveMnemonic(walletAddress, 'FROM_PK');
      const _wallets = JSON.parse(JSON.stringify(wallets));
      _wallets.push(wallet);
      await saveWallets(_wallets);
      await saveSelectedWallet(_wallets.length - 1);
      setWallets((_) => {
        return _wallets;
      });
      setSelectedWallet(_wallets.length - 1);
      setLoading(false)
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert(getLanguageString(language, 'INVALID_PRIVATE_KEY'));
    }
  };

  return (
    <View style={{width: '100%', marginBottom: keyboardShown ? 130 : 0}}>
      <TextInput
        value={privateKey}
        onChangeText={(newText) => {
          setPrivateKey(newText);
        }}
        inputStyle={{
          backgroundColor: theme.inputBackgroundColor,
          color: theme.textColor,
          fontSize: 15,
        }}
        containerStyle={{
          marginVertical: 6,
        }}
      />
      <Button
        style={{marginTop: 12}}
        loading={loading}
        disabled={loading}
        title={getLanguageString(language, 'IMPORT')}
        onPress={importPrivateKey}
      />
    </View>
  );
};
