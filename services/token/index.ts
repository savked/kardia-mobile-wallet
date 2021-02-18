import {ENDPOINT} from '../config';
import {requestWithTimeOut} from '../util';
export const getTokenInfo = async (): Promise<KAITokenInfo> => {
  const options = {
    method: 'GET',
  };
  const response = await requestWithTimeOut(
    fetch(`${ENDPOINT}dashboard/token`, options),
    10 * 1000,
  );
  const responseJSON = await response.json();
  return responseJSON.data || {};
};
