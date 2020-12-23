import '@ethersproject/shims';
import * as EthUtil from 'ethereumjs-util';
import * as Bip39 from 'bip39';
import {hdkey} from 'ethereumjs-wallet';
import * as Sentry from '@sentry/react-native';
import EtherWallet from 'ethereumjs-wallet';

export const getWalletFromPK = (privateKey: string) => {
  const privateKeyBuffer = EthUtil.toBuffer(privateKey);
  return EtherWallet.fromPrivateKey(privateKeyBuffer);
};

export const getWalletFromMnemonic = async (
  mnemonic: string,
): Promise<Wallet | false> => {
  try {
    const seed = await Bip39.mnemonicToSeed(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const masterWallet = root.getWallet();
    const privateKey = masterWallet.getPrivateKeyString();
    const addressStr = masterWallet.getAddressString();
    return {
      address: addressStr,
      privateKey,
      balance: 0,
    };
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
};

export const generateWallet = () => {
  const newWallet = EtherWallet.generate();
  return {
    address: newWallet.getAddressString(),
    privateKey: newWallet.getPrivateKeyString(),
    balance: 0,
  };
};

export const generateMnemonic = () => {
  const strength = 256;
  return Bip39.generateMnemonic(strength);
};
