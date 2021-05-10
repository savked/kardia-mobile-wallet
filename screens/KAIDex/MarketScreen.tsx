import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
// import { useRecoilValue } from 'recoil';
// import { krc20ListAtom } from '../../atoms/krc20';
import Button from '../../components/Button';
import Divider from '../../components/Divider';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { getBalance } from '../../services/krc20';
import { ThemeContext } from '../../ThemeContext';
import { getSelectedWallet, getWallets } from '../../utils/local';
import { formatNumberString, getDigit, parseDecimals } from '../../utils/number';

export default ({triggerSelectPair, tokenFrom: _tokenFrom, tokenTo: _tokenTo, tokenFromLiquidity: _tokenFromLiquidity, tokenToLiquidity: _tokenToLiquidity}: {
  triggerSelectPair: () => void;
  tokenFrom?: PairToken;
  tokenTo?: PairToken;
  tokenFromLiquidity?: string;
  tokenToLiquidity?: string;
}) => {
  const theme = useContext(ThemeContext);
  // const krc20List = useRecoilValue(krc20ListAtom)

  const [tokenFrom, setTokenFrom] = useState<PairToken | undefined>(_tokenFrom)
  const [tokenFromLiquidity, setTokenFromLiquidity] = useState(_tokenFromLiquidity)
  const [amountFrom, setAmountFrom] = useState('0')
  const [balanceFrom, setBalanceFrom] = useState('0');

  const [tokenTo, setTokenTo] = useState<PairToken | undefined>(_tokenTo)
  const [tokenToLiquidity, setTokenToLiquidity] = useState(_tokenToLiquidity)
  const [amountTo, setAmountTo] = useState('0')
  const [balanceTo, setBalanceTo] = useState('0');

  const [editting, setEditting] = useState('');
  const [mode, setMode] = useState('BUY')

  const [rate, setRate] = useState<BigNumber>();

  useEffect(() => {
    (async () => {
      if (!tokenFrom) return;

      const wallets = await getWallets();
      const selectedWallet = await getSelectedWallet();
      const balance = await getBalance(tokenFrom.hash, wallets[selectedWallet].address)
      setBalanceFrom(balance)
    })()
  }, [tokenFrom])

  useEffect(() => {
    (async () => {
      if (!tokenTo) return;

      const wallets = await getWallets();
      const selectedWallet = await getSelectedWallet();
      const balance = await getBalance(tokenTo.hash, wallets[selectedWallet].address)
      setBalanceTo(balance)
    })()
  }, [tokenTo])

  useEffect(() => {
    if (!tokenFromLiquidity || !tokenToLiquidity) return;
    const _rate = (new BigNumber(tokenToLiquidity)).dividedBy(new BigNumber(tokenFromLiquidity))
    setRate(_rate)
  }, [tokenFromLiquidity, tokenToLiquidity])

  useEffect(() => {
    if (editting === 'from' && rate) {
      if (amountFrom === '0' || amountFrom === '') {
        setAmountTo('0');
        return;
      }
      const newTo = (new BigNumber(getDigit(amountFrom))).multipliedBy(rate)
      setAmountTo(formatNumberString(newTo.toFixed()))
    }
  }, [amountFrom, rate])

  useEffect(() => {
    if (editting === 'to' && rate) {
      if (amountTo === '0' || amountTo === '') {
        setAmountFrom('0');
        return;
      }
      const newFrom = (new BigNumber(getDigit(amountTo))).dividedBy(rate)
      setAmountFrom(formatNumberString(newFrom.toFixed()))
    }
  }, [amountTo, rate])

  const handleSwitchToken = () => {
    const _from = JSON.parse(JSON.stringify(tokenFrom))
    const _to = JSON.parse(JSON.stringify(tokenTo))

    const _fromLiquidity = JSON.parse(JSON.stringify(tokenFromLiquidity))
    const _toLiquidity = JSON.parse(JSON.stringify(tokenToLiquidity))

    setAmountFrom('0')
    setAmountTo('0')
    setTokenTo(_from)
    setTokenFrom(_to)
    setTokenFromLiquidity(_toLiquidity)
    setTokenToLiquidity(_fromLiquidity)

  }

  const renderRate = () => {
    if (tokenFrom && tokenTo && tokenFromLiquidity && tokenToLiquidity && rate) {
      return (
        <View style={{marginTop: 12}}>
          <CustomText style={{color: theme.textColor}}>
            1{' '}
            <CustomText style={{color: theme.mutedTextColor}}>{tokenFrom.symbol}</CustomText>{' '}={' '}
            <CustomText style={{color: theme.textColor}}>~ {formatNumberString(rate.toFixed())}</CustomText>
            <CustomText style={{color: theme.mutedTextColor}}> {tokenTo.symbol}</CustomText>
          </CustomText>
        </View>
      )
    }
  }

  return (
    <View style={{width: '100%', alignItems: 'center', backgroundColor: theme.backgroundFocusColor, paddingHorizontal: 16, paddingVertical: 24, borderRadius: 12}}>
      <TouchableOpacity 
        style={{
          backgroundColor: theme.backgroundColor,
          padding: 16, 
          width: '100%',
          borderRadius: 12,
          marginBottom: tokenFrom && tokenTo ? 12 : 0,
          flexDirection: 'row',
          alignItems: 'center'
        }}
        onPress={triggerSelectPair}
      >
        <View style={{flexDirection: 'row', marginRight: 12}}>
          {
            tokenFrom && (
              <Image
                source={{uri: tokenFrom.logo}}
                style={{width: 32, height: 32}}
              />
            )
          }
          {
            tokenTo && (
              <Image
                source={{uri: tokenTo.logo}}
                style={{width: 32, height: 32, marginLeft: -8}}
              />
            )
          }
        </View>
        <View style={{flex: 1}}>
          {tokenFrom && tokenTo && <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 4}}>{tokenFrom.symbol} / {tokenTo.symbol}</CustomText>}
          <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>Click to select pair</CustomText>
        </View>
        <Image
          source={require('../../assets/icon/chevron-right.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
      {tokenFrom && (
        <View style={{width: '100%'}}>
          <CustomText 
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 1,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
              fontWeight: '500',
              marginBottom: 6
            }}
          >
            From
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountFrom}
              onChangeText={(newValue) => {
                setAmountFrom(formatNumberString(getDigit(newValue)))
              }}
              containerStyle={{width: '100%'}}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
                paddingRight: 90
              }}
              onFocus={() => {
                setEditting('from')
              }}
              onBlur={() => {
                setEditting('')
                setAmountFrom(formatNumberString(getDigit(amountFrom)))
              }}
            />
            <View style={{position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: 60}}>
              {
                tokenFrom && (
                  <>
                    <Image
                      source={{uri: tokenFrom.logo}}
                      style={{width: 20, height: 20, marginRight: 8}}
                    />
                    <CustomText style={{color: theme.textColor}}>{tokenFrom.symbol}</CustomText>
                  </>
                )
              }
            </View>
          </View>
          <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
            Balance:{' '}
            <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceFrom, tokenFrom.decimals))}</CustomText>
          </CustomText>
        </View>
      )}
      {
        tokenFrom && tokenTo && (
          <View style={{width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 16}}>
            <Divider height={0.5} style={{width: '100%', backgroundColor: '#F0F1F2'}} />
            <TouchableOpacity 
              style={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                width: 24,
                height: 24,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 2,
                shadowRadius: 4,
                elevation: 9,
              }}
              onPress={handleSwitchToken}
            >
              <Image 
                source={require('../../assets/icon/swap_dark.png')}
                style={{width: 16, height: 16}}
              />
            </TouchableOpacity>
          </View>
        )
      }
      {tokenTo && (
        <View style={{width: '100%', marginTop: 12}}>
          <CustomText 
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 1,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
              fontWeight: '500',
              marginBottom: 6
            }}
          >
            To
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountTo}
              // editable={false}
              onChangeText={(newValue) => {
                setAmountTo(formatNumberString(getDigit(newValue)))
              }}
              containerStyle={{width: '100%'}}
              inputStyle={{
                // backgroundColor: 'rgba(184, 184, 184, 1)',
                // color: 'rgba(28, 28, 40, 0.36)',
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
                paddingRight: 90
              }}
              onFocus={() => {
                setEditting('to')
              }}
              onBlur={() => {
                setEditting('')
                setAmountTo(formatNumberString(getDigit(amountTo)))
              }}
            />
            <View style={{position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: 60}}>
              {
                tokenTo && (
                  <>
                    <Image
                      source={{uri: tokenTo.logo}}
                      style={{width: 20, height: 20, marginRight: 8}}
                    />
                    <CustomText style={{color: theme.textColor}}>{tokenTo.symbol}</CustomText>
                  </>
                )
              }
            </View>
          </View>
          {tokenTo && (
            <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
              Balance:{' '}
              <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceTo, tokenTo.decimals))}</CustomText>
            </CustomText>
          )}
        </View>
      )}
      {renderRate()}
      {
        tokenFrom && tokenTo && (
          <Button
            title="Confirm"
            onPress={() => {}}
            style={{marginTop: 32}}
            textStyle={{
              fontSize: theme.defaultFontSize + 3,
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        )
      }
    </View>
  )
}