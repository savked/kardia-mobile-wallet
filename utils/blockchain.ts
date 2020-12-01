import "@ethersproject/shims"
import * as EthUtil from 'ethereumjs-util';
import EtherWallet from 'ethereumjs-wallet'

export const getWalletFromPK = (privateKey: string) => {
    const privateKeyBuffer = EthUtil.toBuffer(privateKey);
    return EtherWallet.fromPrivateKey(privateKeyBuffer);
}

export const generateWallet = () => {
    const newWallet = EtherWallet.generate();
    return {
        address: newWallet.getAddressString(),
        privateKey: newWallet.getPrivateKeyString(),
        balance: 0
    }
}