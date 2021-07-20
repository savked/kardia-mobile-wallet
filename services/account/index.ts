import {ENDPOINT, RPC_ENDPOINT} from '../config';
// import {requestWithTimeOut} from '../util';
import KardiaClient from 'kardia-js-sdk';
// import { parseKaiBalance } from '../../utils/number';

export const getBalance = async (address: string, timeout?: number): Promise<string> => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const blc = await kardiaClient.account.getBalance(address);
  return blc
};
