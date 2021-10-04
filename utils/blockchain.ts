import '@ethersproject/shims';
import * as EthUtil from 'ethereumjs-util';
import EtherWallet from 'ethereumjs-wallet';
import {ethers} from 'ethers';
import Web3 from 'web3'

export const getWalletFromPK = (privateKey: string) => {
  const privateKeyBuffer = EthUtil.toBuffer(privateKey);
  return EtherWallet.fromPrivateKey(privateKeyBuffer);
};

export const getWalletFromMnemonic = async (
  mnemonic: string,
  path?: string
): Promise<Wallet> => {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic.trim(), path);
  const privateKey = wallet.privateKey;
  const addressStr = wallet.address;

  return {
    address: addressStr,
    privateKey,
    balance: '0',
    staked: 0,
    undelegating: 0,
  };
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
  const wallet = ethers.Wallet.createRandom();
  return wallet.mnemonic.phrase;
};

export const signMessage = (message: string, privateKey: string) => {
  const web3 = new Web3()
  const {signature} = web3.eth.accounts.sign(message, privateKey)
  return signature
}
