import {ENDPOINT, RPC_ENDPOINT} from '../config';
import KardiaClient from 'kardia-dx';
import {cellValue} from './amount';

export const getTxByAddress = async (address: string, page = 1, size = 10) => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(
    `${ENDPOINT}addresses/${address}/txs?page=${page - 1}&limit=${size}`,
    options,
  );
  const responseJSON = await response.json();
  const rawTxs = responseJSON?.data?.data || [];
  return rawTxs.map((item: Record<string, any>) => {
    return {
      from: item.from,
      to: item.to,
      hash: item.hash,
      amount: item.value,
      date: new Date(item.time),
      txFee: item.txFee,
      status: item.status,
    };
  });
};

export const createTx = async (
  wallet: Wallet,
  receiver: string,
  amount: number,
) => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const nonce = await kardiaClient.account.getNonce(wallet.address.trim());
  const txData = {
    receiver,
    gas: 50000,
    nonce,
    gasPrice: 1,
    amount: cellValue(amount),
  };

  if (!wallet.privateKey) {
    throw new Error('Invalid wallet: No private key found');
  }

  return await kardiaClient.transaction.sendTransaction(
    txData,
    wallet.privateKey!,
  );
};
