import {ENDPOINT_GATEWAY, ENDPOINT} from '../config';

export const getBalance = async (address: string): Promise<number> => {
  const options = {
    method: 'GET',
  };
  // const response = await fetch(
  //   `${ENDPOINT_GATEWAY}addresses/${address}/balance`,
  //   options,
  // );
  // const responseJSON = await response.json();
  // return responseJSON.data || 0;
  const response = await fetch(`${ENDPOINT}addresses/${address}`, options);
  const responseJSON = await response.json();
  return responseJSON.data ? responseJSON.data.balance : 0;
};
