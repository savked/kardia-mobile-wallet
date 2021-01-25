import {ENDPOINT} from '../config';

export const getLatestBlock = async () => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(`${ENDPOINT}blocks?page=0&limit=1`, options);
  const responseJSON = await response.json();
  const rawBlockList = responseJSON.data.data || [];

  if (rawBlockList.length === 0) {
    return {};
  }
  return rawBlockList[0];
};
