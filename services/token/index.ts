import {ENDPOINT} from '../config';
export const getTokenInfo = async (): Promise<KAITokenInfo> => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(`${ENDPOINT}dashboard/token`, options);
  const responseJSON = await response.json();
  return responseJSON.data || {};
};
