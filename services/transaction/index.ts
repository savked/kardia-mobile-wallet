import {ENDPOINT} from '../config';
export const getTxByAddress = async (address: string, page = 1, size = 10) => {
  const options = {
    method: 'GET',
  };
  const response = await fetch(
    `${ENDPOINT}addresses/${address}/txs?page=${page - 1}&limit=${size}`,
    options,
  );
  const responseJSON = await response.json();
  const rawTxs = responseJSON?.data?.data || [];
  return rawTxs.map((item: Record<string, any>) => {
    return {
      from: item.from,
      to: item.to,
      hash: item.hash,
      amount: item.value,
      date: new Date(item.time),
      txFee: item.txFee,
    };
  });
};
