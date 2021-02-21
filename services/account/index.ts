import {ENDPOINT_GATEWAY, ENDPOINT} from '../config';
import {requestWithTimeOut} from '../util';

export const getBalance = async (address: string): Promise<number> => {
  try {
    const options = {
      method: 'GET',
    };
    // const response = await fetch(
    //   `${ENDPOINT_GATEWAY}addresses/${address}/balance`,
    //   options,
    // );
    // const responseJSON = await response.json();
    // return responseJSON.data || 0;
    const response = await requestWithTimeOut(
      fetch(`${ENDPOINT}addresses/${address}`, options),
      50 * 1000,
    );
    const responseJSON = await response.json();
    return responseJSON.data ? responseJSON.data.balance : 0;
  } catch (error) {
    console.error('Error getting balance of address ', address);
    throw error;
  }
};
