import {ENDPOINT_GATEWAY} from '../config';

export const getBalance = async (address: string): Promise<number> => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(
    `${ENDPOINT_GATEWAY}addresses/${address}/balance`,
    options,
  );
  const responseJSON = await response.json();
  return responseJSON.data || 0;
};
