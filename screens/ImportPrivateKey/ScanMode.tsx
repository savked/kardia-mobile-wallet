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
} from '../../utils/local';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';

export default () => {
  const language = useRecoilValue(languageAtom);
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
      const balance = await getBalance(walletAddress);
      const staked = await getStakingAmount(walletAddress);
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
      // await saveWallets(_wallets);
      // await saveSelectedWallet(_wallets.length - 1);
      setSelectedWallet(_wallets.length - 1);
      setWallets((_) => {
        return _wallets;
      });
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
