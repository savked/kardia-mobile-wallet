import BigNumber from "bignumber.js";
import { WKAI_SMC } from "../config";

export const isKAI = (tokenAddr: string): boolean => !!(tokenAddr && WKAI_SMC && tokenAddr.toLowerCase() === WKAI_SMC.toLowerCase())

export const parseSymbolWKAI = (symbol: string) => {
  return symbol === 'WKAI' ? 'KAI' : symbol
}

export const getOrderPrice = (order: Record<string, any>) => {
	const amount0 = order.amount0In !== '0' ? new BigNumber(order.amount0In) : new BigNumber(order.amount0Out)
	const amount1 = order.amount1In !== '0' ? new BigNumber(order.amount1In) : new BigNumber(order.amount1Out)
	return amount1.dividedBy(amount0)
}

export const getOrderTotal = (order: Record<string, any>) => {
	return order.amount1In === "0" ? order.amount1Out : order.amount1In
}

export const isBuy = (item: Record<string, any>) => {
	return item.amount0In === "0"
}