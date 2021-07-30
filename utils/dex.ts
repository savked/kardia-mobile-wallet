import BigNumber from "bignumber.js";
import { toChecksumAddress } from "ethereumjs-util";
import { getLogoURL } from "./string";

export const parseSymbolWKAI = (symbol: string) => {
  return symbol === 'WKAI' ? 'KAI' : symbol
}

export const getOrderPrice = (order: Record<string, any>) => {
	// const amount0 = order.amount0In !== '0' ? new BigNumber(order.amount0In) : new BigNumber(order.amount0Out)
	// const amount1 = order.amount1In !== '0' ? new BigNumber(order.amount1In) : new BigNumber(order.amount1Out)
  // return amount1.dividedBy(amount0)

  const amount = getOrderAmount(order)
  const total = getOrderTotal(order)

	return (new BigNumber(total)).dividedBy(new BigNumber(amount))
}

export const getOrderTotal = (order: Record<string, any>) => {
	// return order.amount1In === "0" ? order.amount1Out : order.amount1In
  const amount1In = new BigNumber(order.amount1In)
  const amount1Out = new BigNumber(order.amount1Out)
  if (amount1In.isGreaterThan(amount1Out)) return amount1In.toFixed();
  return amount1Out.toFixed();
}

const getOrderAmount = (order: Record<string, any>) => {
	// return order.amount1In === "0" ? order.amount1Out : order.amount1In
  const amount0In = new BigNumber(order.amount0In)
  const amount0Out = new BigNumber(order.amount0Out)
  if (amount0In.isGreaterThan(amount0Out)) return amount0In.toFixed();
  return amount0Out.toFixed();
}

export const isBuy = (item: Record<string, any>) => {
  const amount0In = new BigNumber(item.amount0In)
  const amount0Out = new BigNumber(item.amount0Out)
	return amount0In.isLessThan(amount0Out)
}

export const pairMapper = (pairs: any[]): Pair[] => {
  return pairs.map((item) => {
    const invert = item.pairIdentity.invert

    let t1 = {
      hash: toChecksumAddress(item.token0.id),
      name: item.token0.name,
      logo: getLogoURL(item.token0.id),
      symbol: item.token0.symbol,
      decimals: Number(item.token0.decimals)
    }

    let t2 = {
      hash: toChecksumAddress(item.token1.id),
      name: item.token1.name,
      logo: getLogoURL(item.token1.id),
      symbol: item.token1.symbol,
      decimals: Number(item.token1.decimals)
    }
    return {
      decimals: 0,
      contract_address: item.id,
      last_updated: null,
      pair_name: '',
      token1: invert ? t2.hash : t1.hash,
      token1_liquidity: !invert ? item.reserve0 : item.reserve1,
      token2: invert ? t1.hash : t2.hash,
      token2_liquidity: !invert ? item.reserve1 : item.reserve0,
      total_liquidity: '',
      t1: invert ? t2 : t1,
      t2: invert ? t1: t2,
      volumeUSD: item.volumeUSD,
      invert,
    }
  })
}

export const getPairPriceInBN = (t1Liquidity: string, t2Liquidity: string) => {
  const bnLq1 = new BigNumber(t1Liquidity)
  const bnLq2 = new BigNumber(t2Liquidity)

  return bnLq2.dividedBy(bnLq1)
}