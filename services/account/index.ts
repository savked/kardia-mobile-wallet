import {ENDPOINT} from '../config';

export const getBalance = async (address: string): Promise<number> => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(
    `${ENDPOINT}addresses/${address}/balance`,
    options,
  );
  const responseJSON = await response.json();
  return responseJSON.data || 0;
};
