import {RPC_ENDPOINT, ENDPOINT} from '../config';
import KardiaClient from 'kardia-js-sdk';
import {requestWithTimeOut} from '../util';

export const getKRC20TokenInfo = async (address: string) => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const krc20 = client.krc20;
  krc20.address = address;

  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };
  const response = await requestWithTimeOut(
    fetch(`${ENDPOINT}contracts/${address}`, requestOptions),
    50 * 1000,
  );
  const responseJSON = await response.json();
  const info = {
    name: await krc20.getName(true),
    symbol: await krc20.getSymbol(true),
    decimals: await krc20.getDecimals(true),
    totalSupply: await krc20.getTotalSupply(),
    avatar: responseJSON.data.logo || '',
    // avatar: '',
  };
  return info;
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
      `${ENDPOINT}token/txs?page=1&limit=100&address=${userAddress}&contractAddress=${tokenAddress}`,
      requestOptions,
    ),
    50 * 1000,
  );
  const responseJSON = await response.json();
  return responseJSON.data
    ? responseJSON.data.data.map((i: any) => {
        i.date = new Date(i.time);
        i.time = new Date(i.time);
        i.status = 1;
        i.type = i.from === userAddress ? 'OUT' : 'IN';
        return i;
      })
    : [];
};

export const estimateKRC20Gas = async (to: string, amount: number) => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const krc20 = client.krc20;

  const estimatedGas = krc20.estimateGas(to, amount);
  return estimatedGas;
};

export const transferKRC20 = async (
  tokenAddress: string,
  privateKey: string,
  to: string,
  amount: number,
  transferPayload: Record<string, any> = {},
) => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const krc20 = client.krc20;
  krc20.address = tokenAddress;

  await krc20.getDecimals(true);

  return krc20.transfer(privateKey, to, amount, transferPayload);
};
