import {ENDPOINT} from '../config';
import {requestWithTimeOut} from '../util';

export const getTokenInfo = async (): Promise<KAITokenInfo> => {
  try {
    const options = {
      method: 'GET',
    };
    const response: any = await requestWithTimeOut(
      fetch(`${ENDPOINT}dashboard/token`, options),
      10 * 1000,
    );
    const responseJSON = await response.json();
    return responseJSON.data || {};
  } catch (error) {
    console.error('Get token info error');
    throw error;
  }
};

export const getKRC20TokensProces = async (): Promise<Record<string, any>> => {
  try {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    const response: any = await requestWithTimeOut(
      fetch("https://api.info.kaidex.io/api/tokens", requestOptions),
      10 * 1000,
    );
    const responseJSON = await response.json();
    return responseJSON.data || {};
  } catch (error) {
    console.error('Get KRC20 token price error');
    throw error;
  }
}