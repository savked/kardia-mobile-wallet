import KaidexClient from 'kaidex-sdk';
import KardiaClient, {KardiaAccount} from 'kardia-js-sdk';
import SWAPABI from './swapABI.json'
import LIMIT_ABI from './limitABI.json'
import { BLOCK_TIME, CACHE_TTL, KAI_TOKEN_NAME, KAI_TOKEN_SYMBOL } from '../../config';
import { DEX_ENDPOINT, DEX_PAIRS_JSON, EXCHANGE_REST, RPC_ENDPOINT } from '../config';
import KRC20ABI from '../krc20/KRC20ABI.json';
// import { cellValueWithDecimals } from '../../utils/number';
import { requestWithTimeOut } from '../util';
import BigNumber from 'bignumber.js';
import { getDeltaTimestamps } from '../../utils/date';
import { apolloKaiBlockClient, apolloKaiDexClient } from './apolloClient';
import { GET_BLOCKS_BY_TIMESTAMPS, GET_PAIR_VOLUME, PAIR_LIST_BY_BLOCK_NUMBER } from './queries';
import { getLogoURL, toChecksum } from '../../utils/string';
import Web3 from 'web3'
import { parseDecimals } from '../../utils/number';
import { getCache, saveCacheByKey } from '../../utils/local';
import { getNonce } from '../account';

let SWAP_ROUTER_SMC = ''
let FACTORY_SMC = ''
let WKAI_SMC = ''
let LIMIT_ORDER_SMC = ''

let reserve: Record<string, any> = {}

let tokenData: Record<string, any> = {}

export const getKAILogo = () => {
  return getLogoURL(WKAI_SMC)
}

export const initDexConfig = async () => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };

  const response: any = await requestWithTimeOut(
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

export const getReserve = async (tokenInAddress: string, tokenOutAddress: string) => {
  const key = `${tokenInAddress}-${tokenOutAddress}`
  const reverseKey = `${tokenOutAddress}-${tokenInAddress}`

  if (reserve[key] && (reserve[key].lastUpdated > Date.now() - BLOCK_TIME * 1000)) {
    return reserve[key].reserve
  }

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

  const {reserveA: reserveIn, reserveB: reserveOut} = await client.getReserves(tokenInAddress, tokenOutAddress)
  reserve[key] = {
    lastUpdated: Date.now(),
    reserve: {
      reserveIn,
      reserveOut
    }
  }
  reserve[reverseKey] = {
    lastUpdated: Date.now(),
    reserve: {
      reserveIn: reserveOut,
      reserveOut: reserveIn
    }
  }

  return {
    reserveIn,
    reserveOut
  }
};

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

    const {reserveIn, reserveOut} = await getReserve(tokenFrom.hash, tokenTo.hash)
  
    const rs = client.calculateOutputAmount({
      amount: amount,
      inputType: tradeInputType === "AMOUNT" ? 0 : 1,
      inputToken: {
        tokenAddress: tokenFrom.hash,
        decimals: tokenFrom.decimals,
        name: tokenFrom.name,
        symbol: tokenFrom.symbol
      },
      reserveIn,
      outputToken: {
        tokenAddress: tokenTo.hash,
        decimals: tokenTo.decimals,
        name: tokenTo.name,
        symbol: tokenTo.symbol
      },
      reserveOut
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

export const formatDexToken = (token: PairToken) => {
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

    return client.isKAI(token.hash) ? {
    ...token,
    tokenAddress: WKAI_SMC,
    name: KAI_TOKEN_NAME,
    symbol: KAI_TOKEN_SYMBOL,
    logo: token.logo,
    wKAI: true,
    decimals: 18
  } : token
}

export const getApproveState = async (token: PairToken, amount: string | number, wallet: Wallet, isLimit = false) => {
  if (amount === '0' || amount === 0) {
    return false
  }
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

  const approveState = await client.getApprovalState({
    tokenAddr: token.hash,
    decimals: token.decimals,
    walletAddress: wallet.address,
    spenderAddress: isLimit ? LIMIT_ORDER_SMC : SWAP_ROUTER_SMC,
    amountToCheck: amount
  })

  return approveState
}

export const approveToken = async (token: PairToken, amount: string | number, wallet: Wallet, isLimit = false) => {

  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const smcInstance = sdkClient.contract
 
  smcInstance.updateAbi(KRC20ABI)

  // const cellValue = cellValueWithDecimals(amount, token.decimals)

  const totalSupply = await smcInstance.invokeContract('totalSupply', []).call(token.hash);
  const bnTotalSypply = new BigNumber(totalSupply);

  const invocation = smcInstance.invokeContract('approve', [isLimit ? LIMIT_ORDER_SMC : SWAP_ROUTER_SMC, bnTotalSypply.toFixed()]);

  const rs = invocation.send(wallet.privateKey!, token.hash, {}, true)
  
  return rs;
}

const queryBlockNumbers = (timestamp: number[]) => apolloKaiBlockClient.query({query: GET_BLOCKS_BY_TIMESTAMPS(timestamp)})

const getBlock = async (timeStamp: number[]) => {
  const { data: fetchedData } = await queryBlockNumbers(timeStamp)
  const blocks: any[] = []
  try {
    if (fetchedData) {
      for (const t in fetchedData) {
        const item = (fetchedData as any)[t]
        if (item.length > 0) {
          blocks.push({
            timestamp: t.split('t')[1],
            number: item[0]['number'],
          })
        }
      }
    }
  } catch (error) { }
  return blocks
}

const queryPairsByBlockNumber = (blocks: any[]) => apolloKaiDexClient.query({ query: PAIR_LIST_BY_BLOCK_NUMBER(blocks) })

export const getTotalVolume = async (volumeUSD: string, pairID: string) => {
  const [t24] = getDeltaTimestamps()

  const _24h_blocks = await getBlock([t24])
  const { data: pairsByBlock1 } = await queryPairsByBlockNumber(_24h_blocks)
  const onedayPairs = pairsByBlock1[`t${_24h_blocks[0].timestamp}`]
  const _oneDayPair = onedayPairs && Array.isArray(onedayPairs) ? onedayPairs.filter(item => item.id === pairID)[0] : null
  let volume24hr = _oneDayPair && _oneDayPair.volumeUSD ? parseFloat(volumeUSD) - parseFloat(_oneDayPair.volumeUSD) : parseFloat(volumeUSD)
  return volume24hr
}

export const get24hPairData = async (pairID: string) => {
  const [t24] = getDeltaTimestamps()

  const _24h_blocks = await getBlock([t24])
  const { data: pairsByBlock1 } = await queryPairsByBlockNumber(_24h_blocks)
  const onedayPairs = pairsByBlock1[`t${_24h_blocks[0].timestamp}`]
  const _oneDayPair = onedayPairs && Array.isArray(onedayPairs) ? onedayPairs.filter(item => item.id === pairID)[0] : null
  return _oneDayPair
}

export const submitLimitOrder = async (params: Record<string, any>, wallet: Wallet) => {
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

  const parsedParam = client.limitOrderCallParameters(params as any);

  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const smcInstance = sdkClient.contract
  smcInstance.updateAbi(LIMIT_ABI)
  let invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);

  const rs = await invocation.send(wallet.privateKey!, LIMIT_ORDER_SMC, {
    amount: parsedParam.amount || 0
  })

  return rs
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

  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const smcInstance = sdkClient.contract
  smcInstance.updateAbi(SWAPABI)

  const paramsWithouFeeOnTransfer = {...params, ...{feeOnTransfer: false}}
  let parsedParam = client.marketSwapCallParameters(paramsWithouFeeOnTransfer as any);
  let invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);

  let shouldHaveFeeOnTransfer = false

  try {
    await sdkClient.transaction.estimateGas({
      from: wallet.address,
      to: SWAP_ROUTER_SMC,
      value: (new BigNumber(parsedParam.amount || 0)).toNumber()
    }, invocation.txData())
  } catch (error) {
    shouldHaveFeeOnTransfer = true
  }

  if (shouldHaveFeeOnTransfer) {
    params.feeOnTransfer = true
    parsedParam = client.marketSwapCallParameters(params as any);
    invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);
  }
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

export const calculatePriceImpact = async (tokenFrom: PairToken, tokenTo: PairToken, amountIn: string, amountOut: string) => {
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

  const priceImpact = await client.calculatePriceImpact({
    inputToken: {
      tokenAddress: tokenFrom.hash,
      name: tokenFrom.name,
      symbol: tokenFrom.symbol,
      decimals: tokenFrom.decimals
    },
    outputToken: {
      tokenAddress: tokenTo.hash,
      name: tokenTo.name,
      symbol: tokenTo.symbol,
      decimals: tokenTo.decimals
    },
    amountIn,
    amountOut
  })

  return priceImpact
}

export const submitReferal = async (referalCode: string, wallet: Wallet) => {
  if (!wallet.privateKey) return false
  if (!referalCode) return false

  // Get ref address
  try {
    const requestOptions = {
      method: 'GET',
    };
    console.log('dddd')
    const rs: any = await requestWithTimeOut(
      fetch(`${EXCHANGE_REST}refs?and=(short.eq.${referalCode},parent_id.eq.0)`, requestOptions),
      50 * 1000,
    )

    const rsJSON = await rs.json()
    if (!rsJSON || !Array.isArray(rsJSON)) {
      return false
    }
    if (rsJSON.length === 0) {
      return false
    }
    const refAddressObj = rsJSON[0];
    const refAddress = refAddressObj.address
    const parentId = refAddressObj.id
    const message = `${wallet.address}-${referalCode}`
    const web3 = new Web3()
    const {signature} = web3.eth.accounts.sign(message, wallet.privateKey!)
    const address = web3.eth.accounts.recover(message, signature)
    if (address !== wallet.address) {
      return false
    } 
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "address": wallet.address,
      "ref": refAddress,
      "parent_id": parentId,
      "signature": signature,
      "short": referalCode
    });

    const postOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw
    };

    console.log('bbbb')

    const refRs = await fetch(`${EXCHANGE_REST}refs`, postOptions)
    if (refRs.ok) {
      console.log('is ok')
      return true
    }
    return false

  } catch (error) {
    console.log(error)
    return false
  }
}

export const getTokenBalance = async (tokenAddress: string, walletAddress: string) => {
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
  
  const sdkClient = new KardiaClient({ endpoint: RPC_ENDPOINT })
  sdkClient.krc20.address = tokenAddress

  const rs = client.isKAI(tokenAddress)
      ? await sdkClient.account.getBalance(walletAddress)
      : await sdkClient.krc20.balanceOf(walletAddress)
  return rs
}

export const getMyPortfolio = async (pairs: Pair[], walletAddress: string) => {
	if (!KardiaAccount.isAddress(walletAddress)) throw new Error('Invalid wallet!')

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

	let myLiquidityList
	// Check liquidity balance in pool pairs
	const checkBalancePromises = pairs.map(pair => getTokenBalance(pair.contract_address, walletAddress))
	const balances = await Promise.all(checkBalancePromises)

	// Then filter pairs with existing liquidity
	myLiquidityList = pairs
    .map((pair, index) => ({ ...pair, balance: balances[index] }))
    .filter((_, index) => !!balances[index] && balances[index] !== '0')

	// Update pairs with pooled Tokens
	const pooledTokenPromises = myLiquidityList
			.map(pair => client.getReserves(pair.t1.hash, pair.t2.hash))
	const pooledTokens = await Promise.all(pooledTokenPromises)
	myLiquidityList = myLiquidityList.map((pair, index) => {
    return {
      ...pair,
      pooledTokens: {
        reserveA: parseDecimals(pooledTokens[index].reserveA, pair.t1.decimals),
        reserveB: parseDecimals(pooledTokens[index].reserveB, pair.t2.decimals)
      }
    }
  })

	// Get share rates & total supplies
	const totalSupplyPromises = myLiquidityList
			.map(pair => client.krc20.getTotalSupply(pair.contract_address))
	const totalSupplies = await Promise.all(totalSupplyPromises)
	myLiquidityList = myLiquidityList.map((pair, index) => {
    const { balance } = pair
    const totalSupply = totalSupplies[index]

    const shareRate = Number(balance) / totalSupply * 100

    const estimatedAmountA = Number(pair.pooledTokens.reserveA) * shareRate / 100
    const estimatedAmountB = Number(pair.pooledTokens.reserveB) * shareRate / 100

    return {
      ...pair,
      provider: walletAddress,
      totalSupply,
      shareRate: shareRate.toString(),
      estimatedAmountA,
      estimatedAmountB
    }
	})

	return myLiquidityList
}

export const addLiquidity = async (params: any, wallet: Wallet) => {
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

  const parsedParam = client.addLiquidityCallParameters(params)
  const sdkClient = new KardiaClient({ endpoint: RPC_ENDPOINT })

  const smcInstance = sdkClient.contract
  smcInstance.updateAbi(SWAPABI)
  console.log(parsedParam)
  const invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);

  // TODO: get local nonce
  // const rs = await invocation.send(wallet.privateKey!, SWAP_ROUTER_SMC, {
  //   amount: parsedParam.amount || 0,
  //   nonce: await getNonce(wallet.address)
  // })
  const rs = await invocation.send(wallet.privateKey!, SWAP_ROUTER_SMC, {
    amount: parsedParam.amount || 0
  })

  return rs
}

export const removeLiquidity = async (params: any, wallet: Wallet) => {
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

  // const parsedParam = await client.removeLiquidityCallParameters(params)
  const sdkClient = new KardiaClient({ endpoint: RPC_ENDPOINT })

  const smcInstance = sdkClient.contract
  smcInstance.updateAbi(SWAPABI)

  const paramsWithouFeeOnTransfer = {...params, ...{feeOnTransfer: false}}
  let parsedParam = await client.removeLiquidityCallParameters(paramsWithouFeeOnTransfer as any);
  let invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);

  let shouldHaveFeeOnTransfer = false

  try {
    await sdkClient.transaction.estimateGas({
      from: wallet.address,
      to: SWAP_ROUTER_SMC,
      value: (new BigNumber(parsedParam.amount || 0)).toNumber()
    }, invocation.txData())
  } catch (error) {
    shouldHaveFeeOnTransfer = true
  }

  if (shouldHaveFeeOnTransfer) {
    params.feeOnTransfer = true
    parsedParam = await client.removeLiquidityCallParameters(params as any);
    invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);
  }

  const rs = await invocation.send(wallet.privateKey!, SWAP_ROUTER_SMC, {
    amount: parsedParam.amount || 0
  })

  return rs
}

const getPairFromHTTP = async () => {
  const requestOptions = {
		method: 'GET',
		redirect: 'follow'
	};

	const rs = await fetch(DEX_PAIRS_JSON, requestOptions)
	try {
		const rsJSON = await rs.json()
		return rsJSON
	} catch (error) {
    console.log('Get pair from HTTP fail')
		console.log(error)
		return []		
	}
}

const getTokenInfoForDex = async (tokenAddress: string) => {

  if (tokenData[tokenAddress.toLowerCase()]) {
    return tokenData[tokenAddress.toLowerCase()]
  }

  const sdkClient = new KardiaClient({ endpoint: RPC_ENDPOINT })
  await sdkClient.krc20.getFromAddress(toChecksum(tokenAddress))

  tokenData[tokenAddress.toLowerCase()] = {
    decimals: sdkClient.krc20.decimals,
    id: sdkClient.krc20.address.toLowerCase(),
    name: sdkClient.krc20.name,
    symbol: sdkClient.krc20.symbol
  }

  return tokenData[tokenAddress.toLowerCase()]

}

export const getPairVolume = async (pairID: string) => {
  try {
    const {error, data: volumeData} = await requestWithTimeOut(
      apolloKaiDexClient.query({ query: GET_PAIR_VOLUME(pairID) }),
      10000
    )
    if (error) {
      console.log('fetch volume fail')
    }
    if (volumeData && volumeData.pairs[0]) {
      return volumeData.pairs[0].volumeUSD
    } else {
      return "0"
    }
  } catch (error) {
    console.log('getPairVolume error')
    return "0"
  }
}

const fetchPairData = async (pairItem: Record<string, any>) => {
  const rs = JSON.parse(JSON.stringify(pairItem))
  
  if (typeof pairItem.token0 === 'string') {
    rs.token0 = await getTokenInfoForDex(pairItem.token0)
  }

  if (typeof pairItem.token1 === 'string') {
    rs.token1 = await getTokenInfoForDex(pairItem.token1)
  }

  return rs
}

export const getPairs = async () => {
  const localCache = await getCache();
  let localPairData
  let newData = false

  let pairData

  try {
    localPairData = JSON.parse(localCache.pairData)    
    if (!localPairData) newData = true

    if (localPairData && localPairData.lastUpdated && Date.now() - Number(localPairData.lastUpdated) > 1) {
      newData = true
    }
  } catch (error) {
    newData = true
  }

  if (!newData && localPairData.pairs.length > 0) {
    pairData = localPairData.pairs
  } else {
    try {
      pairData = await getPairFromHTTP()
      await saveCacheByKey('pairData', JSON.stringify({
        pairs: pairData,
        lastUpdated: Date.now()
      })) 
    } catch (error) {
      console.log('Error fetch pair')
      pairData = []
    }
  }

  const filledData = await Promise.all(pairData.map(fetchPairData))
  return {
    pairs: filledData
  }
}

export const getMarketHistory = async (pairAddress: string, invert: boolean, type: 'buy' | 'sell') => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  try {
    const rs = await fetch(`${EXCHANGE_REST}rpc/all_swap?pair_address=${pairAddress}&is_revert=${invert}&action_type=${type}`, requestOptions)
    const rsJSON = await rs.json()
    return rsJSON.map((item: any) => {
      return {
        pair: {
          pairIdentity: {
            invert
          }
        },
        id: item.id,
        amount0In: item.amount_0_in,
        amount0Out: item.amount_0_out,
        amount1In: item.amount_1_in,
        amount1Out: item.amount_1_out,
        timestamp: Math.floor(Date.now() / 1000)
      }
    })
  } catch (error) {
    console.error('Error getMarketHistory')
    return []
  }
}

export const cancelOrder = async (orderID: number, wallet: Wallet) => {
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

  const parsedParam = client.cancelLimitOrder({ orderID })

  console.log('parsedParam', parsedParam)

  const sdkClient = new KardiaClient({ endpoint: RPC_ENDPOINT })
  const smcInstance = sdkClient.contract
  smcInstance.updateAbi(LIMIT_ABI)

  const invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);

  // TODO: get local nonce
  // const rs = await invocation.send(wallet.privateKey!, SWAP_ROUTER_SMC, {
  //   amount: parsedParam.amount || 0,
  //   nonce: await getNonce(wallet.address)
  // })
  const rs = await invocation.send(wallet.privateKey!, LIMIT_ORDER_SMC, {
    amount: parsedParam.amount || 0
  })

  return rs
}