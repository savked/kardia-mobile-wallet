import {ENDPOINT, RPC_ENDPOINT} from '../config';
// import {requestWithTimeOut} from '../util';
import KardiaClient from 'kardia-js-sdk';
// import { parseKaiBalance } from '../../utils/number';

export const getBalance = async (address: string, timeout?: number): Promise<number> => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const blc = await kardiaClient.account.getBalance(address);
  return blc
  // try {
  //   const options = {
  //     method: 'GET',
  //   };
  //   timeout && console.log(`${ENDPOINT}addresses/${address}`)
  //   const response = await requestWithTimeOut(
  //     fetch(`${ENDPOINT}addresses/${address}`, options),
  //     timeout || 50 * 1000,
  //   );
    
  //   const responseJSON = await response.json();
  //   timeout && console.log('has response', responseJSON.data ? responseJSON.data.balance : 0)
  //   return responseJSON.data ? responseJSON.data.balance : 0;
  // } catch (error) {
  //   console.error('Error getting balance of address ', address);
  //   throw error;
  // }
};
