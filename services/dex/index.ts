import KaidexClient from 'kaidex-sdk';
import KardiaClient from 'kardia-js-sdk';
import SWAPABI from './swapABI.json'
import { KAI_TOKEN_NAME, KAI_TOKEN_SYMBOL } from '../../config';
import { DEX_ENDPOINT, RPC_ENDPOINT } from '../config';
import KRC20ABI from '../krc20/KRC20ABI.json';
import { cellValueWithDecimals } from '../../utils/number';
import { requestWithTimeOut } from '../util';
import { isKAI } from '../../utils/dex';

let SWAP_ROUTER_SMC = ''
let FACTORY_SMC = ''
let WKAI_SMC = ''
let LIMIT_ORDER_SMC = ''

export const initDexConfig = async () => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };

  const response = await requestWithTimeOut(
    fetch(
      `${DEX_ENDPOINT}cfg/info`,
      requestOptions,
    ),
    50 * 1000,
  );
  
  const responseJSON = await response.json();

  SWAP_ROUTER_SMC = responseJSON.data.router_smc
  FACTORY_SMC = responseJSON.data.factory_smc
  WKAI_SMC = responseJSON.data.wkai_smc
  LIMIT_ORDER_SMC = responseJSON.data.settlement_smc
}

export const calculateDexExchangeRate = async (
  tokenFrom: PairToken,
  tokenTo: PairToken,
) => {
  try {
    const client = new KaidexClient({
      rpcEndpoint: RPC_ENDPOINT,
      smcAddresses: {
        router: SWAP_ROUTER_SMC,
        factory: FACTORY_SMC,
        // kaiSwapper?: string;
        limitOrder: LIMIT_ORDER_SMC,
        wkai: WKAI_SMC
      }
    })
  
    const rate = await client.calculateExchangeRate({
      tokenAddress: tokenFrom.hash,
      decimals: tokenFrom.decimals,
      name: tokenFrom.name,
      symbol: tokenFrom.symbol
    }, {
      tokenAddress: tokenTo.hash,
      decimals: tokenTo.decimals,
      name: tokenTo.name,
      symbol: tokenTo.symbol
    })
    return rate 
  } catch (error) {
    console.log(error)
    return {
      rateAB: 1,
      rateBA: 1
    }
  }
}

export const calculateDexAmountOut = async (
  amount: number | string,
  tradeInputType: 'AMOUNT' | 'TOTAL',
  tokenFrom: PairToken,
  tokenTo: PairToken
) => {
  try {
    const client = new KaidexClient({
      rpcEndpoint: RPC_ENDPOINT,
      smcAddresses: {
        router: SWAP_ROUTER_SMC,
        factory: FACTORY_SMC,
        // kaiSwapper?: string;
        limitOrder: LIMIT_ORDER_SMC,
        wkai: WKAI_SMC
      }
    })
  
    const rs = await client.calculateOutputAmount({
      amount: amount,
      inputType: tradeInputType === "AMOUNT" ? 0 : 1,
      inputToken: {
        tokenAddress: tokenFrom.hash,
        decimals: tokenFrom.decimals,
        name: tokenFrom.name,
        symbol: tokenFrom.symbol
      },
      outputToken: {
        tokenAddress: tokenTo.hash,
        decimals: tokenTo.decimals,
        name: tokenTo.name,
        symbol: tokenTo.symbol
      }
    })

    return rs
  } catch (error) {
    console.log(error)
    if (error.message === 'invalid opcode: opcode 0xfe not defined') {
      return '-1'
    }
    return '1'
  }
}

export const formatDexToken = (token: PairToken, wallet: Wallet) => {
    return isKAI(token.hash) ? {
    ...token,
    tokenAddress: WKAI_SMC,
    name: KAI_TOKEN_NAME,
    symbol: KAI_TOKEN_SYMBOL,
    logo: token.logo,
    wKAI: true,
    decimals: 18
  } : token
}

export const approveToken = async (token: PairToken, amount: string | number, wallet: Wallet) => {

  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const smcInstance = sdkClient.contract

  smcInstance.updateAbi(KRC20ABI)

  const cellValue = cellValueWithDecimals(amount, token.decimals)

  const invocation = smcInstance.invokeContract('approve', [wallet.address, cellValue]);
  const rs = invocation.send(wallet.privateKey!, token.hash)
  
  return rs;
}

export const getTotalVolume = async (pairAddress: string) => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };
  try {
    const response = await requestWithTimeOut(
      fetch(
        `${DEX_ENDPOINT}chart/${pairAddress}/volume`,
        requestOptions,
      ),
      50 * 1000,
    );
    const responseJSON = await response.json();
    return responseJSON.data[responseJSON.data.length - 1].data
  } catch (error) {
    console.log('Get total volume fail')
    console.log(error)
  }
}

export const swapTokens = async (params: Record<string, any>, wallet: Wallet) => {
  const client = new KaidexClient({
    rpcEndpoint: RPC_ENDPOINT,
    smcAddresses: {
      router: SWAP_ROUTER_SMC,
      factory: FACTORY_SMC,
      // kaiSwapper?: string;
      limitOrder: LIMIT_ORDER_SMC,
      wkai: WKAI_SMC
    }
  })
  const parsedParam = client.marketSwapCallParameters(params as any);
  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const smcInstance = sdkClient.contract
  smcInstance.updateAbi(SWAPABI)
  const invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);
  
  const rs = await invocation.send(wallet.privateKey!, SWAP_ROUTER_SMC, {
    amount: parsedParam.amount || 0
  })

  return rs
};

export const calculateTransactionDeadline = async (txDeadlineInMinute: string): Promise<number> => {
  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const latestBlock = await sdkClient.kaiChain.getBlockHeaderByHash('latest')
  return (new Date(latestBlock.time)).getTime() + Number(txDeadlineInMinute) * 60 * 1000;
} 