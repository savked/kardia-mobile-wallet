import {RPC_ENDPOINT} from '../config';
// import {requestWithTimeOut} from '../util';
import KardiaClient from 'kardia-js-sdk';
// import { parseKaiBalance } from '../../utils/number';

export const getBalance = async (address: string, timeout?: number): Promise<string> => {
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const blc = await kardiaClient.account.getBalance(address);
  return blc
};

export const getNonce = async (address: string, force = false) => {
  // TODO: get local nonce
  // const localNonce = await getLocalNonce();
  const kardiaClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const networkNonce = await kardiaClient.account.getNonce(address.trim());
  return networkNonce

  // if (!localNonce[address] || networkNonce > localNonce[address]) {
  //   try {
  //     await saveAddressNonce(address, Number(networkNonce) + 1) 
  //   } catch (error) {
  //     console.error('Error saving nonce')
  //     console.error(error)
  //   }
  //   return networkNonce
  // }

  // if (force === false) {
  //   await saveAddressNonce(address, Number(localNonce[address]) + 1) 
  //   return localNonce[address]
  // } 
  
  // try {
  //   await saveAddressNonce(address, Number(networkNonce) + 1) 
  // } catch (error) {
  //   console.error('Error saving nonce')
  //   console.error(error)
  // }
  // return networkNonce
}
