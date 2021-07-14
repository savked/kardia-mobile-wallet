import KaidexClient from 'kaidex-sdk';
import KardiaClient, {KardiaAccount} from 'kardia-js-sdk';
import SWAPABI from './swapABI.json'
import { BLOCK_TIME, CACHE_TTL, KAI_TOKEN_NAME, KAI_TOKEN_SYMBOL } from '../../config';
import { DEX_ENDPOINT, DEX_PAIRS_JSON, EXCHANGE_REST, RPC_ENDPOINT } from '../config';
import KRC20ABI from '../krc20/KRC20ABI.json';
// import { cellValueWithDecimals } from '../../utils/number';
import { requestWithTimeOut } from '../util';
import BigNumber from 'bignumber.js';
import { getDeltaTimestamps } from '../../utils/date';
import { apolloKaiBlockClient, apolloKaiDexClient } from './apolloClient';
import { GET_BLOCKS_BY_TIMESTAMPS, PAIR_LIST_BY_BLOCK_NUMBER } from './queries';
import { getLogoURL, toChecksum } from '../../utils/string';
import Web3 from 'web3'
import { parseDecimals } from '../../utils/number';
import { getCache, saveCacheByKey } from '../../utils/local';

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

const getReserve = async (tokenInAddress: string, tokenOutAddress: string) => {
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

export const getApproveState = async (token: PairToken, amount: string | number, wallet: Wallet) => {
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
    spenderAddress: SWAP_ROUTER_SMC,
    amountToCheck: amount
  })

  return approveState
}

export const approveToken = async (token: PairToken, amount: string | number, wallet: Wallet) => {

  const sdkClient = new KardiaClient({endpoint: RPC_ENDPOINT});
  const smcInstance = sdkClient.contract
 
  smcInstance.updateAbi(KRC20ABI)

  // const cellValue = cellValueWithDecimals(amount, token.decimals)

  const totalSupply = await smcInstance.invokeContract('totalSupply', []).call(token.hash);
  const bnTotalSypply = new BigNumber(totalSupply);

  // const invocation = smcInstance.invokeContract('approve', [SWAP_ROUTER_SMC, `${cellValue}00`]);
  const invocation = smcInstance.invokeContract('approve', [SWAP_ROUTER_SMC, bnTotalSypply.toFixed()]);
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
  console.log('volumeUSD param', volumeUSD)
  console.log('_oneDayPair', _oneDayPair)
  let volume24hr = _oneDayPair && _oneDayPair.volumeUSD ? parseFloat(volumeUSD) - parseFloat(_oneDayPair.volumeUSD) : parseFloat(volumeUSD)
  return volume24hr
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

    const refRs = await fetch(`${EXCHANGE_REST}refs`, postOptions)
    if (refRs.ok) {
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

  const invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);

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

  // const invocation = smcInstance.invokeContract(parsedParam.methodName, parsedParam.args);

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
		console.log(error)
		return []		
	}
  // return [
  //   {
  //     "id": "0x1ebbf8080149ff07381afd148ba0af007f78cd3c",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0x2eddba8b949048861d2272068a94792275a51658",
  //     "token1": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d"
  //   },
  //   {
  //     "id": "0x256b8a99f69dbdbb5ac781e97f11080a336f5507",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d",
  //     "token1": "0xd675ff2b0ff139e14f86d87b7a6049ca7c66d76e"
  //   },
  //   {
  //     "id": "0x7cd3c7afedd16a72fba66ea35b2e2b301d1b7093",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0x92364ec610efa050d296f1eeb131f2139fb8810e",
  //     "token1": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d"
  //   },
  //   {
  //     "id": "0xdb504f611ae0230bdc60a8f58fe89d3593eb28ce",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d",
  //     "token1": "0xfb62ae373aca027177d1c18ee0862817f9080d08"
  //   },
  //   {
  //     "id": "0x43951c209003a70dca94c2a5b09342c9c84e58ac",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d",
  //     "token1": "0xb697231730c004110a86f51bff4b8dd085c0cb28"
  //   },
  //   {
  //     "id": "0xa5711913ac4bf25c1056d5cf62943743414a58a4",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d",
  //     "token1": "0xeff34b63f55200a9d635b8abbbfcc719b4977864"
  //   },
  //   {
  //     "id": "0x1f95bd3a7d5c9df6bf56504bba948a7adf1c3e27",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d",
  //     "token1": "0xf631bdc21a77afac69b9b3e966e85d7fbcf00b1f"
  //   },
  //   {
  //     "id": "0x3e82f9290a28d4296d34d0c1e6e5366c4220248a",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0x92364ec610efa050d296f1eeb131f2139fb8810e",
  //     "token1": "0xd675ff2b0ff139e14f86d87b7a6049ca7c66d76e"
  //   },
  //   {
  //     "id": "0xe504898459c682b95b60fed35de410a74216fc92",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0x92364ec610efa050d296f1eeb131f2139fb8810e",
  //     "token1": "0xeff34b63f55200a9d635b8abbbfcc719b4977864"
  //   },
  //   {
  //     "id": "0x5b60a5761047b3a9ec340941d904231be85f5c0b",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0x5995f16246dfa676a44b8bd7e751c1226093dcd7",
  //     "token1": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d"
  //   },
  //   {
  //     "id": "0x8a9fc881fc8a2570f403012db123f31842242bec",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0x92364ec610efa050d296f1eeb131f2139fb8810e",
  //     "token1": "0xc1c319434bd861a335752b4b6993c13f139b26fa"
  //   },
  //   {
  //     "id": "0xc2cafdf64d0e403aaf9817556bd99d479c6d4859",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0x75b9d2a0007a6866e32ac0a976fef60cca151f87",
  //     "token1": "0x92364ec610efa050d296f1eeb131f2139fb8810e"
  //   },
  //   {
  //     "id": "0xeaff45672ac6acde598ccd005db3f60ef1b62379",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0x92364ec610efa050d296f1eeb131f2139fb8810e",
  //     "token1": "0xc40926e9f3935d00629d26d025c84384f79f3842"
  //   },
  //   {
  //     "id": "0x687ce55e06a90fd75b6b8fd13468973eea2c6513",
  //     "pairIdentity": {
  //       "invert": true
  //     },
  //     "token0": "0x92364ec610efa050d296f1eeb131f2139fb8810e",
  //     "token1": "0xf8bb30c912a46f57f2b499111cb536db13a044c3"
  //   },
  //   {
  //     "id": "0xab951b7c56682040dc62fff35c8bdb8fdeca8861",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0x72b7181bd4a0b67ca7df2c7778d8f70455dc735b",
  //     "token1": "0xaf984e23eaa3e7967f3c5e007fbe397d8566d23d"
  //   },
  //   {
  //     "id": "0xab40f7752babd3d302337fa1e803bfb2889b870d",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0xc40926e9f3935d00629d26d025c84384f79f3842",
  //     "token1": "0xeff34b63f55200a9d635b8abbbfcc719b4977864"
  //   },
  //   {
  //     "id": "0xaa5554302cca95778eba653d6f3a852a3297f4ca",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0x75b9d2a0007a6866e32ac0a976fef60cca151f87",
  //     "token1": "0xeff34b63f55200a9d635b8abbbfcc719b4977864"
  //   },
  //   {
  //     "id": "0x909eb13a77be16fd6d4a763b701b3aa82a5aff9d",
  //     "pairIdentity": {
  //       "invert": false
  //     },
  //     "token0": "0x72b7181bd4a0b67ca7df2c7778d8f70455dc735b",
  //     "token1": "0xeff34b63f55200a9d635b8abbbfcc719b4977864"
  //   }
  // ]
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

const fetchPairData = async (pairItem: Record<string, any>) => {
  const rs = JSON.parse(JSON.stringify(pairItem))
  
  rs.token0 = await getTokenInfoForDex(pairItem.token0)
  rs.token1 = await getTokenInfoForDex(pairItem.token1)

  // const {reserveA, reserveB} = await client.getReserves(pairItem.token0, pairItem.token1)
  const {reserveIn, reserveOut} = await getReserve(pairItem.token0, pairItem.token1)

  rs.reserve0 = (new BigNumber(reserveIn)).dividedBy(new BigNumber(10 ** Number(rs.token0.decimals))).toFixed()
  rs.reserve1 = (new BigNumber(reserveOut)).dividedBy(new BigNumber(10 ** Number(rs.token1.decimals))).toFixed()
  return rs
}

export const getPairs = async () => {
  const localCache = await getCache();
  const localPairData = localCache.pairData
  let newData = false

  if (!localPairData) newData = true

  if (localPairData && localPairData.lastUpdated && Date.now() - Number(localPairData.lastUpdated) > CACHE_TTL) {
    newData = true
  }

  if (!newData) return localPairData.pairs

  const remoteData = await getPairFromHTTP()

  await saveCacheByKey('pairData', {
    pairs: remoteData,
    lastUpdated: Date.now()
  })

  const filledData = await Promise.all(remoteData.map(fetchPairData))
  return {
    pairs: filledData
  }
}