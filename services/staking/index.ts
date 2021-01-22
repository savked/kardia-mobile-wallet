import {ENDPOINT, RPC_ENDPOINT} from '../config';
import VALIDATOR_ABI from './validatorABI.json';
import KardiaClient from 'kardia-dx';
import {toChecksumAddress} from 'ethereumjs-util';
import {DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE} from '../../config';
import {cellValue} from '../transaction/amount';

const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
const kardiaContract = kardiaClient.contract;

export const mapValidatorRole = (role: number) => {
  switch (role) {
    case 0:
      return 'Candidate';
    case 1:
      return 'Validator';
    case 2:
      return 'Proposer';
  }
};

export const getAllValidator = async () => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(`${ENDPOINT}validators`, options);
  const responseJSON = await response.json();
  return {
    totalStaked: responseJSON.data.totalStakedAmount,
    validators: Array.isArray(responseJSON.data.validators)
      ? responseJSON.data.validators
      : [],
  };
};

export const getCurrentStaking = async (address: string) => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(
    `${ENDPOINT}delegators/${address}/validators`,
    options,
  );
  const responseJSON = await response.json();
  return Array.isArray(responseJSON.data) ? responseJSON.data : [];
};

export const withdrawReward = async (valSmcAddr: string, wallet: Wallet) => {
  try {
    kardiaContract.updateAbi(VALIDATOR_ABI);
    return await kardiaContract
      .invokeContract('withdrawRewards', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
      });
  } catch (error) {
    throw error;
  }
};

export const withdrawDelegatedAmount = async (
  valSmcAddr: string,
  wallet: Wallet,
) => {
  try {
    kardiaContract.updateAbi(VALIDATOR_ABI);
    return await kardiaContract
      .invokeContract('withdraw', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
      });
  } catch (error) {
    throw error;
  }
};

export const undelegateWithAmount = async (
  valSmcAddr: string,
  amountUndel: number,
  wallet: Wallet,
) => {
  try {
    const amountUndelDec = cellValue(amountUndel);
    kardiaContract.updateAbi(VALIDATOR_ABI);
    return await kardiaContract
      .invokeContract('undelegateWithAmount', [amountUndelDec])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
      });
  } catch (error) {
    throw error;
  }
};

export const undelegateAll = async (valSmcAddr: string, wallet: Wallet) => {
  try {
    kardiaContract.updateAbi(VALIDATOR_ABI);
    return await kardiaContract
      .invokeContract('undelegate', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
      });
  } catch (error) {
    throw error;
  }
};

export const delegateAction = async (
  valSmcAddr: string,
  wallet: Wallet,
  amountDel: number,
) => {
  try {
    const cellAmountDel = cellValue(amountDel);
    kardiaContract.updateAbi(VALIDATOR_ABI);
    return await kardiaContract
      .invokeContract('delegate', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        amount: cellAmountDel,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
      });
  } catch (error) {
    throw error;
  }
};
