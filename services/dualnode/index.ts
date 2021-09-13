import { getLogoURL } from "../../utils/string"
import Web3 from 'web3';
import krc20_abi from '../krc20/KRC20ABI.json'
import { BRIDGE_API_ENDPOINT, BSC_RPC_URL, ETH_RPC_URL, RPC_ENDPOINT } from "../config"
import KardiaClient from "kardia-js-sdk";
import { KAI_BRIDGE_ADDRESS } from "../../config";
import kaiBridgeRouterAbi from './KAIBridgeRouter.json'

export const getSupportedChains: () => DualNodeChain[] = () => {
  return [
    {
      name: 'Ethereum',
      supportedTokenStandard: ['ERC20'],
      chainId: 1,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      supportedAssets: [
        {
          id: '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7',
          address: '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7',
          name: 'Ether',
          symbol: 'ETH',
          avatar: getLogoURL('0x1540020a94aA8bc189aA97639Da213a4ca49d9a7'),
          decimals: 18,
          universalSymbol: 'ETH'
        },
        {
          id: '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b',
          address: '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b',
          name: 'Tether USD',
          symbol: 'USDT',
          avatar: getLogoURL('0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b'),
          decimals: 6,
          universalSymbol: 'USDT'
        }
      ],
      otherChainToken: {
        '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7': {
          id: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          name: 'Wrapped Ether',
          symbol: 'WETH',
          decimals: 18,
          universalSymbol: 'ETH'
        },
        '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b': {
          id: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
          universalSymbol: 'USDT'
        }
      },
      underlyingToken: {},
      bridgeContractAddress: {
        fromKardiaChain: {
          '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7': '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7',
          '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b': '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b'
        },
        fromOtherChain: {
          '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7': '0x5Fe301f9479C2962dD48dF2edE79436F9663550a',
          '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b': '0x4D499703a55BD4D6066E8661915b1B0eb435D39c'
        }
      },
      defaultAsset: '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7'
    },
    {
      name: 'Binance Smart Chain',
      supportedTokenStandard: ['BEP20'],
      chainId: 56,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
      supportedAssets: [
        {
          id: '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d',
          address: '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d',
          name: 'Wrapped KAI',
          symbol: 'wKAI',
          avatar: getLogoURL('0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d'),
          decimals: 18,
          universalSymbol: 'KAI'
        },
        {
          id: '0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13',
          address: '0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13',
          name: 'BNB',
          symbol: 'BNB',
          avatar: getLogoURL('0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13'),
          decimals: 18,
          universalSymbol: 'BNB'
        },
        {
          id: '0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93',
          address: '0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93',
          name: 'BUSD',
          symbol: 'BUSD',
          avatar: getLogoURL('0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93'),
          decimals: 18,
          universalSymbol: 'BUSD'
        },
        {
          id: '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7',
          address: '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7',
          name: 'Ether',
          symbol: 'ETH',
          avatar: getLogoURL('0x1540020a94aA8bc189aA97639Da213a4ca49d9a7'),
          decimals: 18,
          universalSymbol: 'ETH'
        },
        {
          id: '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b',
          address: '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b',
          name: 'Tether USD',
          symbol: 'USDT',
          avatar: getLogoURL('0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b'),
          decimals: 6,
          universalSymbol: 'USDT'
        },
        {
          id: '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598',
          address: '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598',
          name: 'Kephi',
          symbol: 'KPHI',
          avatar: getLogoURL('0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598'),
          decimals: 18,
          universalSymbol: 'KPHI'
        }
      ],
      otherChainToken: {
        '0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13': {
          id: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          name: 'Wrapped BNB',
          symbol: 'WBNB',
          decimals: 18,
          universalSymbol: 'BNB',
          avatar: getLogoURL('0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13')
        },
        '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d': {
          id: '0x39Ae8EEFB05138f418Bb27659c21632Dc1DDAb10',
          address: '0x39Ae8EEFB05138f418Bb27659c21632Dc1DDAb10',
          name: 'KardiaChain Token',
          symbol: 'KAI',
          decimals: 18,
          universalSymbol: 'KAI',
          avatar: getLogoURL('0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d')
        },
        '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7': {
          id: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
          address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
          name: 'Binance-Peg Ethereum Token',
          symbol: 'ETH',
          decimals: 18,
          universalSymbol: 'ETH',
          avatar: getLogoURL('0x1540020a94aA8bc189aA97639Da213a4ca49d9a7')
        },
        '0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93': {
          id: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
          address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
          name: 'Binance-Peg BUSD Token',
          symbol: 'BUSD',
          decimals: 18,
          universalSymbol: 'BUSD',
          avatar: getLogoURL('0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93')
        },
        '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b': {
          id: '0x55d398326f99059fF775485246999027B3197955',
          address: '0x55d398326f99059fF775485246999027B3197955',
          name: 'Binance-Peg BSC-USD',
          symbol: 'BSC-USD',
          decimals: 18,
          universalSymbol: 'USDT',
          avatar: getLogoURL('0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b')
        },
        '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598': {
          id: '0xFa4A5C4ce029FD6872400545df44675219C2e037',
          address: '0xFa4A5C4ce029FD6872400545df44675219C2e037',
          name: 'Kephi Token',
          symbol: 'KPHI',
          decimals: 18,
          universalSymbol: 'KPHI',
          avatar: getLogoURL('0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598')
        }
      },
      underlyingToken: {
        '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d': {
          id: '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d',
          address: '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d',
          name: 'KAI',
          symbol: 'KAI',
          avatar: getLogoURL('0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d'),
          decimals: 18,
          universalSymbol: 'KAI'
        },
        '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598': {
          id: '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598',
          address: '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598',
          name: 'Kephi',
          symbol: 'KPHI',
          avatar: getLogoURL('0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598'),
          decimals: 18,
          universalSymbol: 'KPHI'
        }
      },
      bridgeContractAddress: {
        fromKardiaChain: {
          '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d': '0xea4953d9A2655dd8d970C3c1928e3EAbB4d4199D',
          '0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13': '0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13',
          '0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93': '0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93',
          '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7': '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7',
          '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b': '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b',
          '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598': '0xb2C328Fb6D8377caeaFdA8a465b79C67b5EE2550'
        },
        fromOtherChain: {
          '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d': '0xBb14e7905c663B176Aa4FF02Fd4E3688722d5856',
          '0xd7D045BFBa6Ea93b480F409DB3dd1729337C1d13': '0x0a8f0247F838c7E4956823dEC75424ed64B7E5c6',
          '0x3444273AFdf9E00Fd0491C8a97738acA3ebB2A93': '0x8505be08b053bc1d76e511fcab1a2bb082c62ae1',
          '0x1540020a94aA8bc189aA97639Da213a4ca49d9a7': '0xf8D195d5DeA90D5e9bBa32154916AF73bfc3e03D',
          '0x551A5dcAC57C66aA010940c2dcFf5DA9c53aa53b': '0xbB014967977FDEeD4f645DF4768A15932989fac1',
          '0x6CD689DefCA80f9F2CBED9D0C6f3B2Cf4abc4598': '0xb65ca9a3e710970473fd45d4dddd7b8f1253ce28'
        }
      },
      defaultAsset: '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d'
    }
  ]
}

export const getUnderlyingTokenLiquidity = async (contractAddress: string, underlyingAddress: string, networkName: string) => {
  let httpProvider

  if (networkName === 'Binance Smart Chain') {
    httpProvider = new Web3.providers.HttpProvider(BSC_RPC_URL, { timeout: 10000 })
  } else {
    httpProvider = new Web3.providers.HttpProvider(ETH_RPC_URL, { timeout: 10000 })
  }

  const web3 = new Web3(httpProvider)
  const contract = new web3.eth.Contract(krc20_abi as any, underlyingAddress)
  return contract.methods.balanceOf(contractAddress).call()
}

export const getBridgeConfig = async (tokenSymbol: any, chainId: number) => {
  const res = await fetch(BRIDGE_API_ENDPOINT + `/swapconfig/${tokenSymbol.toLowerCase()}/${chainId}`)
  try {
    return res.json()
  } catch (error) {
    console.log('Get bridge config error')
    return {}
  }
}

export const swapCrossChain = async ({
  underlying,
  tokenAddress,
  toAddress,
  amount,
  toChainId,
  wallet
}: {
  underlying: boolean;
  tokenAddress: string;
  toAddress: string;
  amount: string | number;
  toChainId: number;
  wallet: Wallet
}) => {

  try {
    const methodName = underlying ? 'swapOutUnderlying' : 'swapOut'

    const {contract} = new KardiaClient({endpoint: RPC_ENDPOINT})
    contract.updateAbi(kaiBridgeRouterAbi)
    const invocation = contract.invokeContract(methodName, [tokenAddress, toAddress, amount, toChainId])
    console.log({
      tokenAddress, toAddress, amount, toChainId, methodName
    })

    const rs = await invocation.send(wallet.privateKey!, KAI_BRIDGE_ADDRESS, {
      gas: 5000000,
    })

    return rs

  } catch (error) {
    console.log('Swap crosschain error')
    return ''
  }
}