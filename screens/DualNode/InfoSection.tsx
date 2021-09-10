import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import CustomText from '../../components/Text'
import { getBridgeConfig, getSupportedChains } from '../../services/dualnode'
import { ThemeContext } from '../../ThemeContext'
import { cellValueWithDecimals, formatNumberString, getDigit, parseDecimals } from '../../utils/number'
import { getSemiBoldStyle } from '../../utils/style'

export default ({chain, amount, token, minSwap, setMinSwap, maxSwap, setMaxSwap, swapFeeRatePerMillion, setSwapFeeRatePerMillion, swapFee, setSwapFee}: {
  chain: DualNodeChain;
  token: DualNodeToken;
  minSwap: string;
  setMinSwap: (newValue: string) => void 
  maxSwap: string;
  setMaxSwap: (newValue: string) => void 
  swapFeeRatePerMillion: number;
  setSwapFeeRatePerMillion: (newValue: number) => void
  amount: string;
  swapFee: number;
  setSwapFee: (newValue: number) => void
}) => {
  const theme = useContext(ThemeContext)

  const [minimumSwapFee, setMinimumSwapFee] = useState('')
  const [maximumSwapFee, setMaximumSwapFee] = useState('')

  useEffect(() => {
    (async () => {
      const rs = await getBridgeConfig(token.symbol, chain.chainId)

      if (rs.SwapFeeRatePerMillion) {
        setSwapFeeRatePerMillion(rs.SwapFeeRatePerMillion)
      }
      if (rs.MaximumSwapFee) {
        setMaximumSwapFee(rs.MaximumSwapFee)
      }
      if (rs.MinimumSwapFee) {
        setMinimumSwapFee(rs.MinimumSwapFee)
      }

      // Calculating decimal
      const otherChainToken = chain.otherChainToken[token.address]
      if (!otherChainToken) return
      const supportedChain = getSupportedChains()
      let decimal = otherChainToken.decimals
      supportedChain.forEach((_chain) => {
        const _otherChainToken = _chain.otherChainToken[token.address]
        if (!_otherChainToken) return
        if (_otherChainToken.decimals > decimal) {
          decimal = _otherChainToken.decimals
        }
      })

      if (rs.MinimumSwap) {
        const bnValue = new BigNumber(rs.MinimumSwap)
        setMinSwap(bnValue.dividedBy(10**decimal).toFixed())
      }
      if (rs.MaximumSwap) {
        const bnValue = new BigNumber(rs.MaximumSwap)
        setMaxSwap(bnValue.dividedBy(10**decimal).toFixed())
      }
    })()
  }, [chain, token])

  useEffect(() => {
    const _amountDigit = getDigit(amount)

    if (!swapFeeRatePerMillion || !Number(_amountDigit)) {
      setSwapFee(0)
      return;
    }
    // Calculating decimal
    const otherChainToken = chain.otherChainToken[token.address]
    if (!otherChainToken) return
    const supportedChain = getSupportedChains()
    let decimals = otherChainToken.decimals
    supportedChain.forEach((_chain) => {
      const _otherChainToken = _chain.otherChainToken[token.address]
      if (!_otherChainToken) return
      if (_otherChainToken.decimals > decimals) {
        decimals = _otherChainToken.decimals
      }
    })

    const fee = new BigNumber(cellValueWithDecimals(amount, decimals))
        .multipliedBy(swapFeeRatePerMillion)
        .div(1e6)

    const displayedFee = parseDecimals(fee.toString(), decimals)
    let rs = parseFloat(displayedFee)

    const maxValue = parseDecimals(maximumSwapFee, decimals)
    const minValue = parseDecimals(minimumSwapFee, decimals)

    if (parseFloat(displayedFee) > parseFloat(maxValue)) rs = parseFloat(maxValue)
    if (parseFloat(displayedFee) < parseFloat(minValue)) rs = parseFloat(minValue)

    setSwapFee(rs)
  }, [amount, swapFeeRatePerMillion, minimumSwapFee, maximumSwapFee])

  return (
    <>
      <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
        <CustomText
          style={[
            {
              color: theme.mutedTextColor,
              fontSize: theme.defaultFontSize + 1
            },
            getSemiBoldStyle()
          ]}
        >
          Minimum amount
        </CustomText>
        <CustomText
          style={{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {formatNumberString(minSwap)} {token.symbol}
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 12}}>
        <CustomText
          style={[
            {
              color: theme.mutedTextColor,
              fontSize: theme.defaultFontSize + 1
            },
            getSemiBoldStyle()
          ]}
        >
          Maximum amount
        </CustomText>
        <CustomText
          style={{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {formatNumberString(maxSwap)} {token.symbol}
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 12, paddingBottom: 12 }}>
        <CustomText
          style={[
            {
              color: theme.mutedTextColor,
              fontSize: theme.defaultFontSize + 1
            },
            getSemiBoldStyle()
          ]}
        >
          Swap fee
        </CustomText>
        <CustomText
          style={{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {formatNumberString((new BigNumber(swapFee)).toFixed())} {token.symbol}
        </CustomText>
      </View>
    </>
  )
}