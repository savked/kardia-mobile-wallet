import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { Image, Platform, View } from 'react-native'
import Tags from '../../components/Tags'
import CustomText from '../../components/Text'
import CustomTextInput from '../../components/TextInput'
import { getUnderlyingTokenLiquidity } from '../../services/dualnode'
import { ThemeContext } from '../../ThemeContext'
import { formatNumberString, getDigit, getPartial, isNumber, parseDecimals } from '../../utils/number'
import { getSemiBoldStyle } from '../../utils/style'

export default ({
  // underlyingToken,
  amount,
  setAmount,
  token,
  currentBalance,
  chain,
  errorAmount
}: {
  amount: string;
  setAmount: (newAmount: string) => void;
  token: KRC20;
  currentBalance: BigNumber;
  // underlyingToken?: KRC20;
  chain: DualNodeChain;
  errorAmount: string;
}) => {
  const theme = useContext(ThemeContext)

  const [liquidity, setLiquidity] = useState('')

  useEffect(() => {
    (async () => {
      const underlyingToken = getUnderlyingToken()
      const contractAddress = getContractAddress()
      if (!underlyingToken || !contractAddress) return
      const rs = await getUnderlyingTokenLiquidity(contractAddress, underlyingToken.address, chain.name)

      setLiquidity(
        formatNumberString(
          parseDecimals(rs, underlyingToken.decimals)
        )
      )
    })()
  }, [chain, token])

  const getUnderlyingToken = () => {
    if (!token) return undefined
    const underlyingToken = chain.underlyingToken
    return underlyingToken[token.address]
  }

  const getContractAddress = () => {
    if (!token) return undefined
    const contractAddress = chain.contractAddress
    return contractAddress[token.address]
  }

  const shouldHighight = () => {
    const val14 = parseDecimals(getPartial(currentBalance.toFixed(), 0.25, token.decimals), token.decimals)
    const val24 = parseDecimals(getPartial(currentBalance.toFixed(), 0.5, token.decimals), token.decimals)
    const val34 = parseDecimals(getPartial(currentBalance.toFixed(), 0.75, token.decimals), token.decimals)
    const val44 = parseDecimals(getPartial(currentBalance.toFixed(), 1, token.decimals), token.decimals)
    if (val14 === val24 || val14 === val34 || val14 === val44) return false
    if (val24 === val34 || val24 === val44) return false
    if (val34 === val44) return false
    return true
  }

  const renderLiquidity = () => {
    if (!liquidity) return null
    return (
      <CustomText
        style={[{
          color: theme.mutedTextColor,
          marginTop: 12,
          fontSize: theme.defaultFontSize
        }, getSemiBoldStyle()]}
      >
        Liquidity:{' '}
        <CustomText
          style={{
            color: theme.textColor
          }}
        >
          {liquidity}
        </CustomText>
      </CustomText>
    )
  }

  const isPercent = (_amount: string, totalAmount: string, token: KRC20, percent: number) => {
    const digitOnly = getDigit(_amount)
    const percentValue = getDigit(
      formatNumberString(
        parseDecimals(getPartial(totalAmount, percent, token.decimals), token.decimals),
        token.decimals
      )
    )
    return digitOnly === percentValue
  }

  return (
    <>
      <View style={{justifyContent: 'center'}}>
        <CustomTextInput
          keyboardType={Platform.OS === 'android' ? "decimal-pad" : "numbers-and-punctuation"}
          value={amount}
          message={errorAmount}
          onChangeText={(newAmount) => {
            const digitOnly = getDigit(newAmount);

            if (digitOnly === '') {
              setAmount('0');
              return;
            }
            if (isNumber(digitOnly)) {
              let formatedValue = formatNumberString(digitOnly);

              const [numParts, decimalParts] = digitOnly.split('.')
              if (!decimalParts && decimalParts !== "") {
                setAmount(formatedValue);
                return
              }

              formatedValue = formatNumberString(numParts) + '.' + decimalParts

              setAmount(formatedValue);
            }
          }}
          inputStyle={{
            backgroundColor: 'rgba(96, 99, 108, 1)',
            borderWidth: 1.5,
            borderColor: 'rgba(154, 163, 178, 1)',
            color: theme.textColor,
            paddingRight: 90
          }}
        />
        {
          token && 
          <View 
            style={{
              position: 'absolute', 
              right: 16, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'flex-end'
            }}
          >
            <View style={{width: 20, height: 20, backgroundColor: '#FFFFFF', borderRadius: 10, marginRight: 8}}>
              <Image
                source={{uri: token.avatar}}
                style={{width: 20, height: 20}}
              />
            </View>
            <CustomText style={{color: theme.textColor}}>{token.symbol}</CustomText>
          </View>
        }
      </View>
      {renderLiquidity()}
      <View style={{flexDirection: 'row', marginTop: 12}}>
        <Tags 
          content={`25 %`} 
          active={!currentBalance.isEqualTo(0) && shouldHighight() && isPercent(amount, currentBalance.toFixed(), token, 0.25) } 
          containerStyle={{marginRight: 12, flex: 1}} 
          onPress={() => {
            const partialValue = getPartial(currentBalance.toFixed(), 0.25, token.decimals)
            setAmount(formatNumberString(parseDecimals(partialValue, token.decimals), token.decimals))
          }} 
        />
        <Tags 
          content={`50 %`} 
          active={!currentBalance.isEqualTo(0) && shouldHighight() && isPercent(amount, currentBalance.toFixed(), token, 0.5) } 
          containerStyle={{marginRight: 12, flex: 1}} 
          onPress={() => {
            const partialValue = getPartial(currentBalance.toFixed(), 0.5, token.decimals)
            setAmount(formatNumberString(parseDecimals(partialValue, token.decimals), token.decimals))
          }}
        />
        <Tags 
          content={`75 %`} 
          active={!currentBalance.isEqualTo(0) && shouldHighight() && isPercent(amount, currentBalance.toFixed(), token, 0.75) } 
          containerStyle={{marginRight: 12, flex: 1}} 
          onPress={() => {
            const partialValue = getPartial(currentBalance.toFixed(), 0.75, token.decimals)
            console.log('new value', parseDecimals(partialValue, token.decimals))
            setAmount(formatNumberString(parseDecimals(partialValue, token.decimals), token.decimals))
          }}
        />
        <Tags 
          content={`100 %`} 
          containerStyle={{flex: 1}} 
          active={!currentBalance.isEqualTo(0) && shouldHighight() && isPercent(amount, currentBalance.toFixed(), token, 1) } 
          onPress={() => {
            
            let partialValue = getPartial(currentBalance.toFixed(), 1, token.decimals)
            if (token.symbol === 'KAI') {
              const bnPartialValue = new BigNumber(partialValue)
              const ONE_KAI = new BigNumber(10 ** 18)
              // const bn110KAI = new BigNumber(10 ** (tokenTo.decimals))
              const bn110KAI = new BigNumber(partialValue).multipliedBy(new BigNumber(0.1))
              if (bnPartialValue.isGreaterThan(ONE_KAI)) {
                partialValue = bnPartialValue.minus(new BigNumber(10 ** 16)).toFixed(token.decimals, 1)
              } else {
                partialValue = bnPartialValue.minus(bn110KAI).toFixed(token.decimals, 1)
              }
            }
            setAmount(formatNumberString(parseDecimals(partialValue, token.decimals), token.decimals))
          }} 
        />
      </View>
    </>
  )
}