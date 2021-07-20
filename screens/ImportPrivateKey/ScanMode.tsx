/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Alert, Dimensions} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {getLanguageString} from '../../utils/lang';
import {useNavigation} from '@react-navigation/native';
import {getWalletFromPK} from '../../utils/blockchain';
import {getBalance} from '../../services/account';
import {getStakingAmount} from '../../services/staking';
import {
  getWallets,
  saveMnemonic,
  saveWallets,
} from '../../utils/local';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import { referralCodeAtom } from '../../atoms/referralCode';
import { submitReferal } from '../../services/dex';

export default () => {
  const language = useRecoilValue(languageAtom);
  const referralCode = useRecoilValue(referralCodeAtom)
  const navigation = useNavigation();

  const setWallets = useSetRecoilState(walletsAtom);
  const setSelectedWallet = useSetRecoilState(selectedWalletAtom);

  const importPrivateKey = async (_privateKey: string) => {
    if (!_privateKey.includes('0x')) {
      _privateKey = '0x' + _privateKey;
    }

    try {
      const _wallet = getWalletFromPK(_privateKey.trim());
      const walletAddress = _wallet.getChecksumAddressString();
      let balance = '0'
      try {
        balance = await getBalance(walletAddress);
      } catch (error) {
        console.log('Get balance fail import private key')
      }

      let staked = 0
      try {
        staked = await getStakingAmount(walletAddress);
      } catch (error) {
        console.log('Get staked fail import private key')
      }

      const wallets = await getWallets();
      const wallet: Wallet = {
        privateKey: _privateKey.trim(),
        address: walletAddress,
        balance,
        staked,
        name: 'New Wallet',
        undelegating: 0
      };

      const walletExisted = wallets
        .map((item) => item.address)
        .includes(wallet.address);

        if (walletExisted) {
          Alert.alert(getLanguageString(language, 'WALLET_EXISTED'));
          return;
        }
      await saveMnemonic(walletAddress, 'FROM_PK');
      const _wallets = JSON.parse(JSON.stringify(wallets));
      _wallets.push(wallet);
      await saveWallets(_wallets)
      setSelectedWallet(_wallets.length - 1);
      setWallets(_wallets);

      if (referralCode) {
        await submitReferal(referralCode, wallet)
      }

      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } catch (error) {
      console.error(error);
      Alert.alert(getLanguageString(language, 'INVALID_PRIVATE_KEY'));
    }
  };

  return (
    <QRCodeScanner
      onRead={(e) => {
        importPrivateKey(e.data);
      }}
      // flashMode={RNCamera.Constants.FlashMode.torch}
      topViewStyle={{height: 0}}
      bottomViewStyle={{height: 10}}
      cameraStyle={{height: Dimensions.get('window').height}}
    />
  );
};
