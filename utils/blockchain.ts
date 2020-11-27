import * as EthUtil from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet'

export const getWalletFromPK = (privateKey: string) => {
    const privateKeyBuffer = EthUtil.toBuffer(privateKey);
    return Wallet.fromPrivateKey(privateKeyBuffer);
}