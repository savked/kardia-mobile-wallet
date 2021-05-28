import { ENDPOINT, PROXY_ENDPOINT } from "./config";

const DEFAULT_TIMEOUT = 15 * 1000;

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

export const getAppStatus = async (address: string) => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: new Headers({
      'DeviceID': address, 
    })
  };

  const response = await requestWithTimeOut(
    // fetch(`${ENDPOINT}status`, requestOptions),
    fetch(`${PROXY_ENDPOINT}mobile/status`, requestOptions),
    50 * 1000,
  )

  if (!response) {
    return {};
  }

  const responseJSON = await response.json();
  return responseJSON.data;
}
