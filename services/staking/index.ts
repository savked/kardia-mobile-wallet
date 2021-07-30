import {ENDPOINT, RPC_ENDPOINT} from '../config';
import VALIDATOR_ABI from './validatorABI.json';
import KardiaClient from 'kardia-js-sdk';
import {toChecksumAddress} from 'ethereumjs-util';
import {DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE} from '../../config';
import {cellValue, weiToKAI} from '../transaction/amount';
import {requestWithTimeOut} from '../util';
import { getNonce } from '../account';

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
  const response = await requestWithTimeOut(
    fetch(`${ENDPOINT}validators`, options),
    10 * 1000,
  );
  const responseJSON = await (response as any).json();
  return {
    totalStaked: responseJSON.data.totalStakedAmount,
    validators: Array.isArray(responseJSON.data.validators)
      ? responseJSON.data.validators
      : [],
  };
};

export const getValidatorCommissionRate = async (smcAddress: string) => {
  try {
    kardiaContract.updateAbi(VALIDATOR_ABI);
    const rs = await kardiaContract
      .invokeContract('commission', [])
      .call(smcAddress);
    if (rs.status === 0) {
      throw new Error(`Withdraw reward TX Fail: ${rs.transactionHash}`);
    } else {
      return weiToKAI(rs.rate);
    }
  } catch (error) {
    throw error;
  }
};

export const getCurrentStaking = async (address: string) => {
  const options = {
    method: 'GET',
  };
  // const response = await requestWithTimeOut(
  //   fetch(`${ENDPOINT}delegators/${address}/validators`, options),
  //   90 * 1000,
  // );
  const response = await fetch(
    `${ENDPOINT}delegators/${address}/validators`,
    options,
  );
  const responseJSON = await response.json();
  const responseData = Array.isArray(responseJSON.data)
    ? responseJSON.data
    : [];
  return responseData.map((item: Record<string, any>) => {
    // Parse unbonedAmount
    if (!item.unbondedAmount) {
      if (item.totalUnbondedAmount) {
        item.unbondedAmount = item.totalUnbondedAmount;
      } else if (
        !item.unbondedRecords ||
        !Array.isArray(item.unbondedRecords)
      ) {
        item.unbondedAmount = '0';
      }
    }

    // Parse withdrawable amount
    if (!item.withdrawableAmount) {
      if (item.totalWithdrawableAmount) {
        item.withdrawableAmount = item.totalWithdrawableAmount;
      }
    }
    return item;
  });
};

export const getStakingAmount = async (address: string) => {
  try {
    const _staking: Staking[] = await getCurrentStaking(address);
    let total = 0;
    _staking.forEach((item) => {
      total += Number(weiToKAI(item.stakedAmount));
    });
    return total;
  } catch (error) {
    console.error('Get staking amount error for address ', address);
    throw error;
  }
};

export const getUndelegatingAmount = async (address: string) => {
  try {
    const _staking: Staking[] = await getCurrentStaking(address);
    let total = 0;
    _staking.forEach((item) => {
      total += Number(weiToKAI(item.unbondedAmount)) + Number(weiToKAI(item.withdrawableAmount));
    });
    return total;
  } catch (error) {
    console.error('Get staking amount error for address ', address);
    throw error;
  }
};

export const withdrawReward = async (valSmcAddr: string, wallet: Wallet) => {
  if (!valSmcAddr || valSmcAddr === '') {
    throw new Error('Invalid [valSmcAddr]')
  }
  try {
    const nonce = await getNonce(wallet.address)
    kardiaContract.updateAbi(VALIDATOR_ABI);
    const rs = await kardiaContract
      .invokeContract('withdrawRewards', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
        nonce
      });
    if (rs.status === 0) {
      throw new Error(`Withdraw reward TX Fail: ${rs}`);
    } else {
      return rs;
    }
  } catch (error) {
    throw error;
  }
};

export const withdrawDelegatedAmount = async (
  valSmcAddr: string,
  wallet: Wallet,
) => {
  if (!valSmcAddr || valSmcAddr === '') {
    throw new Error('Invalid [valSmcAddr]')
  }
  try {
    const nonce = await getNonce(wallet.address)
    kardiaContract.updateAbi(VALIDATOR_ABI);
    const rs = await kardiaContract
      .invokeContract('withdraw', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
        nonce
      });
    if (rs.status === 0) {
      throw new Error(`Withdraw delegated TX Fail: ${rs.transactionHash}`);
    } else {
      return rs;
    }
  } catch (error) {
    throw error;
  }
};

export const undelegateWithAmount = async (
  valSmcAddr: string,
  amountUndel: number,
  wallet: Wallet,
) => {
  if (!valSmcAddr || valSmcAddr === '') {
    throw new Error('Invalid [valSmcAddr]')
  }
  try {
    const nonce = await getNonce(wallet.address)
    const amountUndelDec = cellValue(amountUndel);
    kardiaContract.updateAbi(VALIDATOR_ABI);
    const rs = await kardiaContract
      .invokeContract('undelegateWithAmount', [amountUndelDec])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
        nonce
      });
    if (rs.status === 0) {
      throw new Error(`Undelegate TX Fail: ${rs}`);
    } else {
      return rs;
    }
  } catch (error) {
    throw error;
  }
};

export const undelegateAll = async (valSmcAddr: string, wallet: Wallet) => {
  if (!valSmcAddr || valSmcAddr === '') {
    throw new Error('Invalid [valSmcAddr]')
  }
  try {
    const nonce = await getNonce(wallet.address)
    kardiaContract.updateAbi(VALIDATOR_ABI);
    const rs = await kardiaContract
      .invokeContract('undelegate', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
        nonce
      });
    // if (rs.status === 0) {
    //   throw new Error(`Undelegate TX Fail: ${rs}`);
    // } else {
      return rs;
    // }
  } catch (error) {
    throw error;
  }
};

export const delegateAction = async (
  valSmcAddr: string,
  wallet: Wallet,
  amountDel: number,
) => {
  if (!valSmcAddr || valSmcAddr === '') {
    throw new Error('Invalid [valSmcAddr]')
  }
  try {
    const nonce = await getNonce(wallet.address)
    const cellAmountDel = cellValue(amountDel);
    kardiaContract.updateAbi(VALIDATOR_ABI);
    const rs = await kardiaContract
      .invokeContract('delegate', [])
      .send(wallet.privateKey || '', toChecksumAddress(valSmcAddr), {
        from: wallet.address,
        amount: cellAmountDel,
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: DEFAULT_GAS_PRICE,
        nonce
      });
    // if (rs.status === 0) {
    //   throw new Error(`Delegate TX Fail: ${rs.transactionHash}`);
    // } else {
      return rs;
    // }
  } catch (error) {
    throw error;
  }
};
