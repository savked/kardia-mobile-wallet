import abiDecoder from 'abi-decoder';
import BigNumber from 'bignumber.js';
import KardiaClient from 'kardia-js-sdk';
import { cellValueWithDecimals } from '../../utils/number';
import { ENDPOINT, RPC_ENDPOINT } from '../config';
import { requestWithTimeOut } from '../util';
import KRC20ABI from './KRC20ABI.json';

export const getKRC20TokenInfo = async (address: string) => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const krc20 = client.krc20;
  krc20.address = address;

  await krc20.getFromAddress(address)

  const totalSupply: BigNumber = await krc20.getTotalSupply("BigNumber")
  let avatar = ''

  try {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
    };
    const response: any = await requestWithTimeOut(
      fetch(`${ENDPOINT}contracts/${address}`, requestOptions),
      50 * 1000,
    );
    const responseJSON = await response.json();
    avatar = responseJSON.data.logo
  } catch (error) {
    console.log('Error getting token info from backend')
  }

  const info = {
    name: krc20.name,
    symbol: krc20.symbol,
    decimals: krc20.decimals,
    totalSupply: totalSupply.toFixed(),
    avatar,
  };
  return info;
};

export const getBalance = async (tokenAddress: string, userAddress: string): Promise<string> => {
  try {
    const client = new KardiaClient({endpoint: RPC_ENDPOINT});
    const krc20 = client.krc20;
    krc20.address = tokenAddress;
    const balance = await krc20.balanceOf(userAddress);
    return balance;
  } catch (error) {
    console.log('error', userAddress, tokenAddress)
    return '0'
  }
};

export const getTxDetail = async (
  tokenAddress: string,
  userAddress: string,
  transactionHash: string,
) => {

  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const txReceipt = await client.transaction.getTransactionReceipt(transactionHash)

  if (txReceipt) {
    const txObj = await client.transaction.getTransaction(transactionHash)

    abiDecoder.addABI(KRC20ABI)

    const decoded = abiDecoder.decodeMethod(txObj.input)
    return {
      ...txReceipt,
      hash: txReceipt.transactionHash,
      date: new Date(txObj.time),
      time: new Date(txObj.time),
      type: txReceipt.from === userAddress ? 'OUT' : 'IN',
      to: (decoded.params as any[]).find((item) => item.name === '_receiver').value,
      value: (decoded.params as any[]).find((item) => item.name === '_amount').value,
    }
  }

  return {}
};

export const getTx = async (tokenAddress: string, userAddress: string, page: number) => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };
  const response: any = await requestWithTimeOut(
    fetch(
      `${ENDPOINT}token/txs?page=${page}&limit=15&address=${userAddress}&contractAddress=${tokenAddress}`,
      requestOptions,
    ),
    50 * 1000,
  );
  const responseJSON = await response.json();
  let haveMore = true
  if (responseJSON?.data?.total >= 0 && responseJSON.data.data.length === 0) {
    haveMore = false
  } else if (responseJSON?.data?.total > responseJSON.data.data.length * (responseJSON?.data?.page)) {
    haveMore = true
  }
  return responseJSON.data
    ? {
        data: responseJSON.data.data.map((i: any) => {
          i.date = new Date(i.time);
          i.time = new Date(i.time);
          i.status = 1;
          i.type = i.from === userAddress ? 'OUT' : 'IN';
          return i;
        }),
        haveMore: haveMore
      }
    : {
      data: [],
      haveMore: false
    };
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
  amount: number | string,
  transferPayload: Record<string, any> = {},
) => {
  const client = new KardiaClient({endpoint: RPC_ENDPOINT});
  const krc20 = client.krc20;
  krc20.address = tokenAddress;
  await krc20.getDecimals(true);

  return krc20.transfer(privateKey, to, amount, transferPayload);
};

export const getVerifiedTokenList = async () => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };
  const response: any = await requestWithTimeOut(
    fetch(`${ENDPOINT}contracts?type=KRC20&status=Verified`, requestOptions),
    50 * 1000,
  );
  const responseJSON = await response.json();
  const tokenList: KRC20[] = responseJSON.data.data.map((item: any) => {
    return {
      id: item.address,
      name: item.name,
      address: item.address,
      symbol: item.tokenSymbol,
      avatar: item.logo,
      decimals: item.decimal,
    }
  });
  return tokenList;
}

export const approveKRC20Token = async (token: KRC20, wallet: Wallet, spender: string) => {

  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const smcInstance = sdkClient.contract
 
  smcInstance.updateAbi(KRC20ABI)

  // const cellValue = cellValueWithDecimals(amount, token.decimals)

  const totalSupply = await smcInstance.invokeContract('totalSupply', []).call(token.address);
  const bnTotalSypply = new BigNumber(totalSupply);

  const invocation = smcInstance.invokeContract('approve', [spender, bnTotalSypply.toFixed()]);

  const rs = invocation.send(wallet.privateKey!, token.address, {}, true)
  
  return rs;
}

export const getKRC20ApproveState = async (token: KRC20, amountToCheck: string | number, wallet: Wallet, spender: string) => {
  if (amountToCheck === '0' || amountToCheck === 0) {
    return false
  }

  try {
    const {contract: kardiaContract} = new KardiaClient({endpoint: RPC_ENDPOINT})

    kardiaContract.updateAbi(KRC20ABI)
    const invoke = kardiaContract.invokeContract('allowance', [wallet.address, spender]);
    const allowance = await invoke.call(token.address, {}, "latest")

    const rawValueAmount = new BigNumber(amountToCheck ? cellValueWithDecimals(amountToCheck.toString(), token.decimals) : '0');
    const rawValueAllowance = new BigNumber(allowance ? allowance : '0');

    return rawValueAllowance.isGreaterThanOrEqualTo(rawValueAmount)
  } catch (error) {
    console.log('getKRC20ApproveState error')
    return false
  }
}