import KardiaClient from 'kardia-js-sdk';
import { PROXY_ENDPOINT, RPC_ENDPOINT } from "./config";

const DEFAULT_TIMEOUT = 15 * 1000;
const DEFAULT_RETRY = 3;

/**
 * Set timeout for HTTP request or any promise
 * @param promise Promise that will be set with timeout
 * @param timeout Time in millisecond
 */
export const requestWithTimeOut = (promise: Promise<any>, timeout?: number) => {
  const _timeout = timeout || DEFAULT_TIMEOUT;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), _timeout);
  });

  return Promise.race([timeoutPromise, promise]);
};

export const requestWithRetry = async (promise: Promise<any>, retry: number = DEFAULT_RETRY): Promise<any> => {
  try {
    const rs = await promise
    return rs
  } catch (error) {
    if (retry > 0) {
      return requestWithRetry(promise, retry - 1)
    } else {
      throw (error)
    }
  }
};

export const getAppStatus = async (address: string) => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: new Headers({
      'DeviceID': address, 
    })
  };

  try {
    const response: any = await requestWithTimeOut(
      // fetch(`${ENDPOINT}status`, requestOptions),
      fetch(`${PROXY_ENDPOINT}mobile/status`, requestOptions),
      50 * 1000,
    )
    if (!response) {
      return {};
    }
    const responseJSON = await response.json();
    return responseJSON.data;
  } catch (error) {
    console.log('getAppStatus error', error)
    return {};
  }
}

export const checkBlockchainStatus = async () => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT})
  try {
    await client.kaiChain.netVersion()
    return true
  } catch (error) {
    console.log('Get net version error')
    return false
  }
}
