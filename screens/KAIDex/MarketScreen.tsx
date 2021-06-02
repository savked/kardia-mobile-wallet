import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import TxSettingModal from './TxSettingModal'
import Button from '../../components/Button';
import Divider from '../../components/Divider';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { approveToken, calculateDexAmountOut, calculateTransactionDeadline, formatDexToken, getApproveState, getTotalVolume } from '../../services/dex';
import { getBalance } from '../../services/krc20';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getSelectedWallet, getWallets } from '../../utils/local';
import { formatNumberString, getDecimalCount, getDigit, getPartial, isNumber, parseDecimals } from '../../utils/number';
import { swapTokens } from '../../services/dex';
import { useNavigation } from '@react-navigation/core';
import Tags from '../../components/Tags';
import AuthModal from '../common/AuthModal';
import { getErrorKey } from '../../utils/error';

export default ({triggerSelectPair, tokenFrom: _tokenFrom, tokenTo: _tokenTo, tokenFromLiquidity: _tokenFromLiquidity, tokenToLiquidity: _tokenToLiquidity, pairAddress}: {
  triggerSelectPair: () => void;
  tokenFrom?: PairToken;
  tokenTo?: PairToken;
  tokenFromLiquidity: string;
  tokenToLiquidity: string;
  pairAddress: string;
}) => {
  const navigation = useNavigation()
  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom)
  

  const [tokenFrom, setTokenFrom] = useState<PairToken | undefined>(_tokenFrom)
  const [tokenFromLiquidity, setTokenFromLiquidity] = useState(_tokenFromLiquidity)
  const [amountFrom, setAmountFrom] = useState('0')
  const [amountFromTimeout, setAmountFromTimeout] = useState<any>()
  const [balanceFrom, setBalanceFrom] = useState('0');
  const [loadingFrom, setLoadingFrom] = useState(false);
  const [loadingTo, setLoadingTo] = useState(false);

  const [approvedState, setApprovedState] = useState(true)
  const [approving, setApproving] = useState(false);

  const [tokenTo, setTokenTo] = useState<PairToken | undefined>(_tokenTo)
  const [tokenToLiquidity, setTokenToLiquidity] = useState(_tokenToLiquidity)
  const [amountTo, setAmountTo] = useState('0')
  const [amountToTimeout, setAmountToTimeout] = useState<any>()
  const [balanceTo, setBalanceTo] = useState('0');
  const [volume, setVolume] = useState('0');

  const [editting, setEditting] = useState('');
  const [processing, setProcessing] = useState(false)
  const [mode, setMode] = useState('BUY')

  const [rate, setRate] = useState<BigNumber | number>();
  const [txDeadline, setTxDeadline] = useState('2')
  const [slippageTolerance, setSlippageTolerance] = useState('1')

  const [showTxSettingModal, setShowTxSettingModal] = useState(false)
  const [swapError, setSwappError] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  // const [onAuthSuccess, setOnAuthSuccess] = useState<() => void>(() => {})

  const onAuthSuccess = () => {
    if (!approvedState) {
      handleApprove()
    } else {
      handleSubmitMarket()
    }
  }

  useEffect(() => {
    setTokenFromLiquidity(_tokenFromLiquidity)
  }, [_tokenFromLiquidity])

  useEffect(() => {
    setTokenToLiquidity(_tokenToLiquidity)
  }, [_tokenToLiquidity])

  useEffect(() => {
    if (!_tokenFrom) return
    setTokenFrom(formatDexToken(_tokenFrom, wallets[selectedWallet]))
  }, [_tokenFrom])

  useEffect(() => {
    if (!_tokenTo) return
    setTokenTo(formatDexToken(_tokenTo, wallets[selectedWallet]))
  }, [_tokenTo])

  useEffect(() => {
    (async () => {
      if (!tokenFrom) return;
      const wallets = await getWallets();
      const selectedWallet = await getSelectedWallet();
      if (tokenFrom.symbol === 'KAI') {
        setBalanceFrom(wallets[selectedWallet].balance)
      } else if (tokenFrom.symbol !== 'WKAI') {
        const balance = await getBalance(tokenFrom.hash, wallets[selectedWallet].address)
        setBalanceFrom(balance)
      }
    })()
  }, [tokenFrom])

  useEffect(() => {
    (async () => {
      if (!tokenTo) return;

      const wallets: Wallet[] = await getWallets();
      const selectedWallet: number = await getSelectedWallet();

      if (tokenTo.symbol === 'KAI') {
        setBalanceTo(wallets[selectedWallet].balance.toString())
      } else if (tokenTo.symbol !== 'WKAI') {
        const balance = await getBalance(tokenTo.hash, wallets[selectedWallet].address)
        setBalanceTo(balance.toString())

        const _approveState = await getApproveState(tokenTo, getDigit(amountTo), wallets[selectedWallet])
        setApprovedState(_approveState)
      }
    })()
  }, [tokenTo])

  useEffect(() => {
    (async () => {
      if (!_tokenFromLiquidity || !_tokenToLiquidity || !pairAddress || !_tokenFrom || !_tokenTo) return;
      const _volume = await getTotalVolume(pairAddress)
      setVolume(_volume);

      const bnFrom = new BigNumber(_tokenFromLiquidity).dividedBy(10 ** _tokenFrom.decimals)
      const bnTo = new BigNumber(_tokenToLiquidity).dividedBy(10 ** _tokenTo.decimals)
      const _rate = bnTo.dividedBy(bnFrom)
      setRate(_rate)
    })()
  }, [_tokenFromLiquidity, _tokenToLiquidity])

  useEffect(() => {
    (async () => {
      if (editting === 'from' && rate && tokenFrom && tokenTo) {
        const _amountFrom = getDigit(amountFrom, false)
        if (_amountFrom === '0' || _amountFrom === '') {
          setAmountTo('0');
          return;
        }

        setLoadingTo(true)

        if (amountToTimeout) {
          clearTimeout(amountToTimeout)
        }

        const timeoutId = setTimeout(async () => {
          const _newTo = await calculateDexAmountOut(_amountFrom, "TOTAL", tokenTo, tokenFrom)

          if (tokenTo) {
            const _approveState = await getApproveState(tokenTo, _newTo, wallets[selectedWallet])
            setApprovedState(_approveState)
          }

          setAmountTo(formatNumberString(_newTo))
          setLoadingTo(false)
          clearTimeout(timeoutId)
          setAmountToTimeout(null)
        }, 1000)
        setAmountToTimeout(timeoutId)
      }
    })()
  }, [amountFrom, rate])

  useEffect(() => {
    (async () => {
      if (editting === 'to' && rate && tokenFrom && tokenTo) {
        const _amountTo = getDigit(amountTo, false)
        if (_amountTo === '0' || _amountTo === '') {
          setAmountFrom('0');
          return;
        }

        setLoadingFrom(true)

        if (amountFromTimeout) {
          clearTimeout(amountFromTimeout)
        }
        const timeoutId = setTimeout(async () => {
          const _approveState = await getApproveState(tokenTo, _amountTo, wallets[selectedWallet])
          setApprovedState(_approveState)

          const _newFrom = await calculateDexAmountOut(_amountTo, "AMOUNT", tokenTo, tokenFrom)
          setAmountFrom(formatNumberString(_newFrom))
          setLoadingFrom(false)
          clearTimeout(timeoutId)
          setAmountToTimeout(null)

        }, 1000)

        setAmountFromTimeout(timeoutId)
      }
    })()
  }, [amountTo, rate])

  const handleSwitchToken = async () => {
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
    setSwappError('')

    // const _rate = await calculateDexExchangeRate(_from, _to)
    // setRate(new BigNumber(_rate.rateBA))

    if (mode === 'BUY') {
      setMode('SELL')
    } else {
      setMode('BUY')
    }
  }

  const handleApprove = async () => {
    if (!tokenFrom || !tokenTo) return;
    setSwappError('')
    setApproving(true)

    try {
      const _wallets = await getWallets();
      const _selectedWalelt = await getSelectedWallet();
      
      await approveToken(tokenTo, getDigit(amountTo), _wallets[_selectedWalelt])
      
      const _approveState = await getApproveState(tokenTo, getDigit(amountTo), wallets[selectedWallet])
      setApprovedState(_approveState)
      setApproving(false) 
    } catch (error) {
      setApprovedState(false)
      setApproving(false)
      setSwappError(getLanguageString(language, 'APPROVE_ERROR'))
    }
  }

  const authForApprove = () => {
    setShowAuthModal(true)
    // setOnAuthSuccess(handleApprove)
  }

  const handleSubmitMarket = async () => {
    if (!tokenFrom || !tokenTo) return;
    const bnTo = new BigNumber(getDigit(amountTo))
    const bnBalanceTo = new BigNumber(parseDecimals(getDigit(balanceTo), tokenTo.decimals))
    if (bnTo.isGreaterThan(bnBalanceTo)) {
      setSwappError(getLanguageString(language, 'NOT_ENOUGH_KRC20_FOR_TX').replace('{{SYMBOL}}', tokenTo.symbol))
      return;
    }

    setProcessing(true)
    setSwappError('')

    try {
      const _wallets = await getWallets();
      const _selectedWallet = await getSelectedWallet();
      
      // Swap token
      const swapParams = {
        amountIn: getDigit(amountTo),
        amountOut: getDigit(amountFrom),
        inputToken: {
          tokenAddress: tokenTo.hash,
          decimals: tokenTo.decimals
        },
        outputToken: {
          tokenAddress: tokenFrom.hash,
          decimals: tokenFrom.decimals
        },
        addressTo: _wallets[_selectedWallet].address,
        inputType: editting === 'to' ? 0 : 1,
        slippageTolerance,
        txDeadline: await calculateTransactionDeadline(txDeadline),
      }

      const txResult = await swapTokens(swapParams, _wallets[_selectedWallet])
      setProcessing(false)

      if (txResult) {
        // Handling success tx
        setAmountFrom('0')
        setAmountTo('0')
        setSwappError('')
        navigation.navigate('Transaction', {
          screen: 'SuccessTx',
          params: {
            type: 'dex',
            pairAddress,
            dexAmount: mode === 'SELL' ? getDigit(amountTo) : getDigit(amountFrom),
            tokenSymbol: mode === 'SELL' ? tokenTo.symbol : tokenFrom.symbol,
            dexMode: `DEX_MODE_${mode}`,
            txHash: txResult
          },
        });
      } else {
        // Handling fail tx
        console.log('Swap fail')
        console.log(txResult)
        setSwappError(getLanguageString(language, 'SWAP_GENERAL_ERROR'))
      }

    } catch (error) {
      const ERROR_KEY = error.message ? getErrorKey(error.message) : 'SWAP_GENERAL_ERROR'
      setSwappError(getLanguageString(language, ERROR_KEY))
      setProcessing(false);
    }
  }

  const authForSubmitMarket = () => {
    setShowAuthModal(true)
    // setOnAuthSuccess(() => handleSubmitMarket())
  }

  const renderRate = () => {
    if (_tokenFrom && _tokenTo && rate) {
      return (
        <View style={{marginTop: 12}}>
          <CustomText style={{color: theme.textColor}}>
            1{' '}
            <CustomText style={{color: theme.mutedTextColor}}>{_tokenFrom.symbol}</CustomText>{' '}={' '}
            <CustomText style={{color: theme.textColor}}>~ {formatNumberString(rate.toFixed())}</CustomText>
            <CustomText style={{color: theme.mutedTextColor}}> {_tokenTo.symbol}</CustomText>
          </CustomText>
        </View>
      )
    }
  }

  const renderSetting = () => {
    if (tokenFrom && tokenTo && tokenFromLiquidity && tokenToLiquidity && rate) {
      return (
        <View style={{width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 16}}>
          <TxSettingModal
            visible={showTxSettingModal}
            slippageTolerance={slippageTolerance}
            deadline={txDeadline}
            onClose={() => {
              setShowTxSettingModal(false);
            }}
            onSubmit={(newDeadline, newSlippageTolerance) => {
              setTxDeadline(newDeadline);
              setSlippageTolerance(newSlippageTolerance);
              setShowTxSettingModal(false);
            }}
          />
          <Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%'}} onPress={() => setShowTxSettingModal(true)}>
            <Image style={{width: 16, height: 16, marginRight: 4}} source={require('../../assets/icon/setting_dark.png')} />
            <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'TX_SETTING')}</CustomText>
          </TouchableOpacity>
        </View>
      )
    }
  }

  const renderButton = () => {
    if (!tokenFrom || !tokenTo) return null;

    if (amountFrom === '0' || amountTo === '0') {
      return (
        <Button
          title={getLanguageString(language, 'ENTER_AMOUNT')}
          disabled={true}
          onPress={() => {}}
          style={{
            marginTop: 32,
            width: '100%',
          }}
          textStyle={{
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        />
      )
    }

    if (!approvedState) {
      return (
        <View
          style={{
            marginTop: 24,
            width: '100%',
          }}
        >
          <CustomText
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 1,
              fontStyle: 'italic'
            }}
          >
            {getLanguageString(language, 'APPROVE_NOTE')}
          </CustomText>
          <Button
            title={getLanguageString(language, 'APPROVE')}
            loading={approving}
            disabled={approving}
            onPress={authForApprove}
            style={{
              marginTop: 8,
              width: '100%',
            }}
            textStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        </View>
      )
    } else {
      return (
        <Button
          loadingColor={mode === 'BUY' ? '#000000' : '#FFFFFF'}
          loading={processing}
          disabled={processing}
          title={
            mode === 'BUY' ? 
            `${getLanguageString(language, 'BUY')} ${tokenFrom.symbol}` : 
            `${getLanguageString(language, 'SELL')} ${tokenTo.symbol}`
          }
          type="secondary"
          onPress={authForSubmitMarket}
          style={{
            marginTop: 32,
            width: '100%',
            backgroundColor: mode === 'BUY' ? 'rgba(105, 235, 102, 1)' : 'rgba(255, 66, 67, 1)'
          }}
          textStyle={{
            fontSize: theme.defaultFontSize + 3,
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            color: mode === 'BUY' ? '#000000' : '#FFFFFF'
          }}
        />
      )
    }
  }

  return (
    <View 
      style={{
        width: '100%',
        alignItems: 'center',
        backgroundColor: theme.backgroundFocusColor,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 12,
        borderRadius: 12,
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 12,
        shadowRadius: 8,
        elevation: 11,
      }}>
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
        <AuthModal
          visible={showAuthModal}
          onClose={() => {
            setShowAuthModal(false)
          }}
          onSuccess={onAuthSuccess}
        />
        <View style={{flexDirection: 'row', marginRight: 12}}>
          {
            _tokenFrom && (
              <View style={{width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16}}>
                <Image
                  source={{uri: _tokenFrom.logo}}
                  style={{width: 32, height: 32}}
                />
              </View>
            )
          }
          {
            _tokenTo && (
              <View 
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  marginLeft: -8,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffset: {
                    width: -6,
                    height: 0,
                  },
                  shadowOpacity: 12,
                  shadowRadius: 8,
                  elevation: 11,
                }}
              >
                <Image
                  source={{uri: _tokenTo.logo}}
                  style={{width: 32, height: 32}}
                />
              </View>
            )
          }
        </View>
        <View style={{flex: 1}}>
          {_tokenFrom && _tokenTo && <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 4}}>{_tokenFrom.symbol} / {_tokenTo.symbol}</CustomText>}
          <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>
            {
              tokenFrom && tokenTo ? 
                <CustomText>
                  {getLanguageString(language, 'VOLUME_24H')}{' '}
                  <CustomText style={{color: theme.textColor}}>
                    ${formatNumberString(volume, 6)}
                  </CustomText>
                </CustomText>
                : getLanguageString(language, 'CLICK_TO_SELECT_PAIR')
            }
          </CustomText>
        </View>
        <Image
          source={require('../../assets/icon/chevron-right.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
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
            {getLanguageString(language, 'FROM')}
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountTo}
              keyboardType="numeric"
              editable={editting !== 'from'}
              loading={loadingTo}
              onChangeText={(newValue) => {
                const digitOnly = getDigit(newValue, tokenTo.decimals === 0 ? false : true);
                if (digitOnly === '') {
                  setAmountTo('0')
                }
                if (getDecimalCount(newValue) > tokenTo.decimals) {
                  return;
                }
                // if (new BigNumber(digitOnly).isGreaterThan(new BigNumber(parseDecimals(tokenToLiquidity!, tokenTo.decimals)))) {
                //   // setAmountFrom(new BigNumber(parseDecimals(tokenToLiquidity!, tokenTo.decimals)).toFixed())
                //   return;
                // }
              
                if (isNumber(digitOnly)) {
                  let formatedValue = formatNumberString(digitOnly);
                  
                  if (tokenTo.decimals == 0) {
                    setAmountTo(formatedValue);
                    return
                  }

                  const [numParts, decimalParts] = digitOnly.split('.')

                  if (!decimalParts && decimalParts !== "") {
                    setAmountTo(formatedValue);
                    return
                  }

                  formatedValue = formatNumberString(numParts) + '.' + decimalParts

                  // if (newValue[newValue.length - 1] === '.') formatedValue += '.'
                  // else if (newValue[newValue.length - 2] === '.' && newValue[newValue.length - 1] === '0') formatedValue += '.0'
                  setAmountTo(formatedValue)
                }
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
            <View style={{position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 60}}>
              {
                tokenTo && (
                  <>
                    <View style={{width: 20, height: 20, backgroundColor: '#FFFFFF', borderRadius: 10, marginRight: 8}}>
                      <Image
                        source={{uri: tokenTo.logo}}
                        style={{width: 20, height: 20}}
                      />
                    </View>
                    <CustomText style={{color: theme.textColor}}>{tokenTo.symbol}</CustomText>
                  </>
                )
              }
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 12}}>
            <Tags 
              content={`25 %`} 
              active={balanceTo !== '0' && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 0.25, tokenTo.decimals), tokenTo.decimals) } 
              containerStyle={{marginRight: 12}} 
              onPress={() => {
                setEditting('to')
                const partialValue = getPartial(balanceTo, 0.25, tokenTo.decimals)
                setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals)))
              }} 
            />
            <Tags 
              content={`50 %`} 
              active={balanceTo !== '0' && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 0.5, tokenTo.decimals), tokenTo.decimals) } 
              containerStyle={{marginRight: 12}} 
              onPress={() => {
                setEditting('to')
                const partialValue = getPartial(balanceTo, 0.5, tokenTo.decimals)
                setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals)))
              }}
            />
            <Tags 
              content={`75 %`} 
              active={balanceTo !== '0' && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 0.75, tokenTo.decimals), tokenTo.decimals) } 
              containerStyle={{marginRight: 12}} 
              onPress={() => {
                setEditting('to')
                const partialValue = getPartial(balanceTo, 0.75, tokenTo.decimals)
                setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals)))
              }}
            />
            <Tags 
              content={`100 %`} 
              active={balanceTo !== '0' && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 1, tokenTo.decimals), tokenTo.decimals) } 
              onPress={() => {
                setEditting('to')
                let partialValue = getPartial(balanceTo, 1, tokenTo.decimals)
                if (tokenTo.symbol === 'KAI') {
                  const bnPartialValue = new BigNumber(partialValue)
                  const bn1KAI = new BigNumber(10 ** (tokenTo.decimals))
                  partialValue = bnPartialValue.minus(bn1KAI).toFixed(tokenTo.decimals, 1)
                }
                setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals)))
              }} 
            />
          </View>
          <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
            {getLanguageString(language, 'BALANCE')}:{' '}
            <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceTo, tokenTo.decimals), 6)}</CustomText>
          </CustomText>
          <CustomText style={{marginTop: 2, color: theme.mutedTextColor, lineHeight: 20}}>
            Liquidity:{' '}
            <CustomText style={{color: theme.textColor}}>
              {formatNumberString(new BigNumber(parseDecimals(tokenToLiquidity!, tokenTo.decimals)).toFixed(), 6)}
            </CustomText>
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
            {getLanguageString(language, 'TO')}
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountFrom}
              keyboardType="numeric"
              loading={loadingFrom}
              onChangeText={(newValue) => {
                // setAmountFrom(formatNumberString(getDigit(newValue)))
                const digitOnly = getDigit(newValue, tokenFrom.decimals === 0 ? false : true);
                if (digitOnly === '') {
                  setAmountFrom('0')
                }
                if (getDecimalCount(newValue) > tokenFrom.decimals) {
                  return;
                }
                if (new BigNumber(digitOnly).isGreaterThan(new BigNumber(parseDecimals(tokenFromLiquidity!, tokenFrom.decimals)))) {
                  // setAmountFrom(new BigNumber(parseDecimals(tokenFromLiquidity!, tokenFrom.decimals)).toFixed())
                  return;
                }
              
                if (isNumber(digitOnly)) {
                  let formatedValue = formatNumberString(digitOnly);
                  
                  if (tokenFrom.decimals == 0) {
                    setAmountFrom(formatedValue);
                    return
                  }

                  const [numParts, decimalParts] = digitOnly.split('.')

                  if (!decimalParts && decimalParts !== "") {
                    setAmountFrom(formatedValue);
                    return
                  }

                  formatedValue = formatNumberString(numParts) + '.' + decimalParts

                  // if (newValue[newValue.length - 1] === '.') formatedValue += '.'
                  // else if (newValue[newValue.length - 2] === '.' && newValue[newValue.length - 1] === '0') formatedValue += '.0'
                  setAmountFrom(formatedValue)
                }
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
            <View style={{position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 60}}>
              {
                tokenFrom && (
                  <>
                    <View style={{width: 20, height: 20, backgroundColor: '#FFFFFF', borderRadius: 10, marginRight: 8}}>
                      <Image
                        source={{uri: tokenFrom.logo}}
                        style={{width: 20, height: 20}}
                      />
                    </View>
                    <CustomText style={{color: theme.textColor}}>{tokenFrom.symbol}</CustomText>
                  </>
                )
              }
            </View>
          </View>
          <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
            {getLanguageString(language, 'BALANCE')}:{' '}
            <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceFrom, tokenFrom.decimals))}</CustomText>
          </CustomText>
          <CustomText style={{marginTop: 2, color: theme.mutedTextColor, lineHeight: 20}}>
            Liquidity:{' '}
            <CustomText style={{color: theme.textColor}}>
              {formatNumberString(new BigNumber(parseDecimals(tokenFromLiquidity!, tokenFrom.decimals)).toFixed(), 6)}
            </CustomText>
          </CustomText>
        </View>
      )}
      {renderRate()}
      {renderSetting()}
      {renderButton()}
      <CustomText
        style={{
          color: 'rgba(255, 66, 67, 1)',
          marginTop: swapError ? 12 : 0,
          fontSize: theme.defaultFontSize + 1,
          textAlign: 'left',
          width: '100%'
        }}
      >
        {swapError}
      </CustomText>
    </View>
  )
}