import { getLogoURL } from "../../utils/string"
import Web3 from 'web3';
import krc20_abi from '../krc20/KRC20ABI.json'
import { BRIDGE_API_ENDPOINT, BSC_RPC_URL, DUALNODE_CONFIG_JSON, ETH_RPC_URL, RPC_ENDPOINT } from "../config"
import KardiaClient from "kardia-js-sdk";
import { KAI_BRIDGE_ADDRESS } from "../../config";
import kaiBridgeRouterAbi from './KAIBridgeRouter.json'
import { parseDecimals } from "../../utils/number";

export const getSupportedChains: () => Promise<DualNodeChain[]> = async () => {
  const requestOptions = {
		method: 'GET',
		redirect: 'follow'
	};

	const rs = await fetch(DUALNODE_CONFIG_JSON, requestOptions)
	try {
		const rsJSON = await rs.json()
		return rsJSON
	} catch (error) {
    console.log('Get pair from HTTP fail')
		console.log(error)
		return []		
	}
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
  const symbol = tokenSymbol.toLowerCase() === 'wkai' ? 'kai' : tokenSymbol.toLowerCase()
  const res = await fetch(BRIDGE_API_ENDPOINT + `/swapconfig/${symbol}/${chainId}`)
  try {
    const rs = await res.json()
    return rs
  } catch (error) {
    console.log('Get bridge config error')
    return undefined
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

export const getOtherChainToken = (token: KRC20, chain: DualNodeChain) => {
  if (!token) return undefined
  const otherChainToken = chain.otherChainToken
  return otherChainToken[token.address]
} 

export const getContractAddressFromOtherChain = (token: KRC20, chain: DualNodeChain) => {
  if (!token) return undefined
  const contractAddress = chain.bridgeContractAddress.fromOtherChain
  if (!contractAddress) return undefined
  return contractAddress[token.address]
}

export const getDualNodeLiquidity = async (token: KRC20, chain: DualNodeChain) => {
  const otherChainToken = getOtherChainToken(token, chain)
  const contractAddress = getContractAddressFromOtherChain(token, chain)

  if (!otherChainToken || !contractAddress) return
  const rs = await getUnderlyingTokenLiquidity(contractAddress, otherChainToken.address, chain.name)
  return parseDecimals(rs, otherChainToken.decimals)
}