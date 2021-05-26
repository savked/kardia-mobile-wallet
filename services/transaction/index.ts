import {ENDPOINT, RPC_ENDPOINT} from '../config';
import KardiaClient from 'kardia-js-sdk';
import {cellValue, weiToKAI} from './amount';

export const estimateGas = async (payload: Record<string, any>, data = '') => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  return kardiaClient.transaction.estimateGas(payload, data);
};

export const getTxByAddress = async (address: string, page = 1, size = 10) => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(
    `${ENDPOINT}addresses/${address}/txs?page=${page}&limit=${size}`,
    options,
  );
  try {
    const responseJSON = await response.json();
    const rawTxs = responseJSON?.data?.data || [];
    let haveMore = true
    if (responseJSON?.data?.total >= 0 && rawTxs.length === 0) {
      haveMore = false
    } else if (responseJSON?.data?.total > rawTxs.length * (responseJSON?.data?.page)) {
      haveMore = true
    }
    return {
      data: rawTxs.map((item: Record<string, any>) => {
        return {
          from: item.from,
          to: item.to,
          hash: item.hash,
          amount: item.value,
          date: new Date(item.time),
          txFee: item.txFee,
          status: item.status,
          toName: item.toName,
          decodedInputData: item.decodedInputData
        };
      }),
      haveMore: haveMore
    };
  } catch (error) {
    console.error('Error getting TX from backend');
    throw error;
  }
};

export const getRecomendedGasPrice = async () => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const gasPrice = await kardiaClient.kaiChain.getGasPrice()

  return Number(gasPrice)
}

export const createTx = async (
  wallet: Wallet,
  receiver: string,
  amount: number,
  gasPrice = 1 * (10 ** 9),
) => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const nonce = await kardiaClient.account.getNonce(wallet.address.trim());
  const txData = {
    receiver,
    gas: 50000,
    nonce,
    gasPrice,
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

export const getTxDetail = async (txHash: string): Promise<Transaction> => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(`${ENDPOINT}txs/${txHash}`, options);
  const responseJSON = await response.json();
  const tx = responseJSON?.data || {};
  return {
    from: tx.from,
    to: tx.to,
    hash: tx.hash,
    amount: weiToKAI(tx.value),
    date: new Date(tx.time),
    fee: weiToKAI(tx.txFee),
    gasPrice: tx.gasPrice,
    gas: tx.gas,
    gasUsed: tx.gasUsed,
    gasLimit: tx.gasLimit,
    blockHash: tx.blockHash,
    blockNumber: tx.blockNumber,
    status: tx.status,
  };
};
