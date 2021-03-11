import {RPC_ENDPOINT, ENDPOINT} from '../config';
import KardiaClient from 'kardia-js-sdk';
import {requestWithTimeOut} from '../util';

export const getKRC20TokenInfo = async (address: string) => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const krc20 = client.krc20;
  krc20.address = address;

  return {
    name: await krc20.getName(true),
    symbol: await krc20.getSymbol(true),
    decimals: await krc20.getDecimals(),
    totalSupply: await krc20.getTotalSupply(),
  };
};

export const getBalance = async (tokenAddress: string, userAddress: string) => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const krc20 = client.krc20;
  krc20.address = tokenAddress;

  const balance = await krc20.balanceOf(userAddress);
  return balance;
};

export const getTx = async (tokenAddress: string, userAddress: string) => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };

  const response = await requestWithTimeOut(
    fetch(
      `${ENDPOINT}contracts/events?page=0&limit=10&methodName=Transfer&contractAddress=${tokenAddress}`,
      requestOptions,
    ),
    50 * 1000,
  );
  const responseJSON = await response.json();
  return responseJSON.data
    ? responseJSON.data.data
        .filter(
          (item: KRC20Transaction) =>
            item.arguments.from === userAddress ||
            item.arguments.to === userAddress,
        )
        .map((i: any) => {
          i.date = new Date(i.time);
          return i;
        })
    : [];
};
