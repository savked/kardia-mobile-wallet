import {ENDPOINT, RPC_ENDPOINT} from '../config';
import KardiaClient from 'kardia-js-sdk';
import {cellValue, weiToKAI} from './amount';
import { BigNumber } from 'bignumber.js';
import { isHexString } from '@ethersproject/bytes';
import { DEFAULT_GAS_PRICE, DEFAULT_KAI_TX_GAS_LIMIT } from '../../config';

export const estimateGas = async (payload: Record<string, any>, data = '') => {
  const _payload = JSON.parse(JSON.stringify(payload))
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});

  if (_payload.value && isHexString(_payload.value)) {
    const bnValue = new BigNumber(_payload.value, 16)
    _payload.value = bnValue.toNumber()
  }

  if (_payload.gas && isHexString(_payload.gas)) {
    const bnValue = new BigNumber(_payload.gas, 16)
    _payload.gas = bnValue.toNumber()
  }

  if (_payload.gasPrice && isHexString(_payload.gasPrice)) {
    const bnValue = new BigNumber(_payload.gasPrice)
    _payload.gasPrice = bnValue.toNumber()
  }

  return kardiaClient.transaction.estimateGas(_payload, data);
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

  try {
    const gasPrice = await kardiaClient.kaiChain.getGasPrice()

    return Number(gasPrice)
  } catch (error) {
    console.log(error)
    return DEFAULT_GAS_PRICE
  }
}

export const sendRawTx = async (txObj: Record<string, any>, wallet: Wallet, waitUntilmined = false) => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const nonce = await kardiaClient.account.getNonce(wallet.address.trim());
  txObj.nonce = nonce
  const txResult = await kardiaClient.transaction.sendTransaction(
    txObj,
    wallet.privateKey!,
    waitUntilmined
  );

  if (!waitUntilmined) return txResult

  return txResult.transactionHash;
}

export const createTx = async (
  wallet: Wallet,
  receiver: string,
  amount: number,
  gasPrice = 1 * (10 ** 9),
) => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  // TODO: get local nonce
  const nonce = await kardiaClient.account.getNonce(wallet.address.trim());
  const txData = {
    receiver,
    gas: DEFAULT_KAI_TX_GAS_LIMIT,
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

  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});

  const txReceipt = await kardiaClient.transaction.getTransactionReceipt(txHash)

  if (txReceipt) {
    const txObj = await kardiaClient.transaction.getTransaction(txHash)

    const gasPriceBN = new BigNumber(txObj.gasPrice)
    const gasUsedBN = new BigNumber(txReceipt.gasUsed)

    return {
      ...txReceipt,
      amount: weiToKAI(txObj.value),
      date: new Date(txObj.time),
      fee: weiToKAI(gasUsedBN.multipliedBy(gasPriceBN).toFixed()),
      // gasPrice: tx.gasPrice,
      gas: txObj.gas,
      // gasUsed: tx.gasUsed,
      gasLimit: txObj.gas,
      blockNumber: txObj.blockNumber,
      hash: txObj.hash
    }
  }

  return {} as any
};
