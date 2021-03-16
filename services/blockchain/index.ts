import {ENDPOINT} from '../config';
import {requestWithTimeOut} from '../util';

export const getLatestBlock = async () => {
  const options = {
    method: 'GET',
  };
  const response = await requestWithTimeOut(
    fetch(`${ENDPOINT}blocks?page=1&limit=1`, options),
    10 * 1000,
  );
  const responseJSON = await response.json();
  const rawBlockList = responseJSON.data.data || [];

  if (rawBlockList.length === 0) {
    return {};
  }
  return rawBlockList[0];
};
