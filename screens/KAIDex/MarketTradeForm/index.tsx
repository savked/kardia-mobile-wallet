import { useQuery } from '@apollo/client';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { cacheSelector } from '../../../atoms/cache';
import { languageAtom } from '../../../atoms/language';
import { pendingTxSelector } from '../../../atoms/pendingTx';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import Divider from '../../../components/Divider';
import Tags from '../../../components/Tags';
import CustomText from '../../../components/Text';
import CustomTextInput from '../../../components/TextInput';
import { getBalance } from '../../../services/account';
import { approveToken, calculateDexAmountOut, calculatePriceImpact, calculateTransactionDeadline, formatDexToken, getApproveState, getReserve, getTotalVolume, swapTokens } from '../../../services/dex';
import { GET_PAIRS } from '../../../services/dex/queries';
import { getBalance as getKRC20Balance } from '../../../services/krc20';
import { ThemeContext } from '../../../ThemeContext';
import { getErrorKey, isRecognizedError } from '../../../utils/error';
import { getLanguageString, parseError } from '../../../utils/lang';
import { getSelectedWallet, getWallets, saveWallets } from '../../../utils/local';
import { formatNumberString, getDecimalCount, getDigit, getPartial, isNumber, parseDecimals } from '../../../utils/number';
import AuthModal from '../../common/AuthModal';
import TxSettingModal from '../TxSettingModal';

let _tokenFrom: PairToken
let _tokenTo: PairToken
let _tokenFromLiquidity: string
let _tokenToLiquidity: string

export default ({
  pairItem,
  onSuccess,
  onClose
}: {
  pairItem: Pair;
  onClose: () => void;
  onSuccess:  
    ({
      mode, 
      amountTo,
      amountFrom,
      txResult,
      isLimit
    }: {
      mode: string 
      amountTo: string
      amountFrom: string
      txResult: string | Record<string, any>
      isLimit?: boolean
    }) => void
}) => {
  const [wallets, setWallets] = useRecoilState(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom)
  
  const [volumeUSD, setVolumeUSD] = useState('') //

  const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallets[selectedWallet].address))

  // const [tokenFrom, setTokenFrom] = useState<PairToken | undefined>(_tokenFrom)
  const [tokenFrom, setTokenFrom] = useState<PairToken | undefined>()
  // const [tokenFromLiquidity, setTokenFromLiquidity] = useState(_tokenFromLiquidity)
  const [tokenFromLiquidity, setTokenFromLiquidity] = useState('')
  const [amountFrom, setAmountFrom] = useState('0')
  const [amountFromTimeout, setAmountFromTimeout] = useState<any>()
  const [balanceFrom, setBalanceFrom] = useState('0');
  const [loadingFrom, setLoadingFrom] = useState(false);
  const [loadingTo, setLoadingTo] = useState(false);

  const [inited, setInited] = useState(false)

  const [approvedState, setApprovedState] = useState(true)
  const [approving, setApproving] = useState(false);

  // const [tokenTo, setTokenTo] = useState<PairToken | undefined>(_tokenTo)
  const [tokenTo, setTokenTo] = useState<PairToken | undefined>()
  // const [tokenToLiquidity, setTokenToLiquidity] = useState(_tokenToLiquidity)
  const [tokenToLiquidity, setTokenToLiquidity] = useState('')
  const [amountTo, setAmountTo] = useState('0')
  const [amountToTimeout, setAmountToTimeout] = useState<any>()
  const [balanceTo, setBalanceTo] = useState('0');
  const [volume, setVolume] = useState('0');

  const [editting, setEditting] = useState('');
  const [processing, setProcessing] = useState(false)
  const [mode, setMode] = useState('BUY')
  const [inputType, setInputType] = useState(0)

  const [rate, setRate] = useState<BigNumber>(new BigNumber(0));
  // const [txDeadline, setTxDeadline] = useState('2')
  const [txDeadline, setTxDeadline] = useRecoilState(cacheSelector('txDeadline'))
  // const [slippageTolerance, setSlippageTolerance] = useState('1')
  const [slippageTolerance, setSlippageTolerance] = useRecoilState(cacheSelector('slippageTolerance'))

  const [showTxSettingModal, setShowTxSettingModal] = useState(false)
  const [swapError, setSwappError] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  // const [onAuthSuccess, setOnAuthSuccess] = useState<() => void>(() => {})
  const [priceImpact, setPriceImpact] = useState('0');

  const { data: volumeData, refetch } = useQuery(GET_PAIRS, {fetchPolicy: 'no-cache'});

  const onAuthSuccess = () => {
    if (!approvedState) {
      handleApprove()
    } else {
      handleSubmitMarket()
    }
  }

  const estimateRate = () => {
    if (amountTo === '0' || amountFrom === '0' || !tokenTo || !tokenFrom) return rate
    const to = tokenTo.hash === _tokenTo.hash ? amountTo : amountFrom
    const from = tokenTo.hash === _tokenTo.hash ? amountFrom : amountTo

    return new BigNumber(getDigit(to)).dividedBy(new BigNumber(getDigit(from)))
  }

  useEffect(() => {
    setTokenFromLiquidity(_tokenFromLiquidity)
  }, [_tokenFromLiquidity])

  useEffect(() => {
    setTokenToLiquidity(_tokenToLiquidity)
  }, [_tokenToLiquidity])

  useEffect(() => {
    if (!_tokenFrom) return
    setTokenFrom(formatDexToken(_tokenFrom))
  }, [_tokenFrom])

  useEffect(() => {
    if (!_tokenTo) return
    setTokenTo(formatDexToken(_tokenTo))
  }, [_tokenTo])

  useEffect(() => {
    (async () => {
      if (!tokenFrom) return;
      if (tokenFrom.symbol === 'KAI') {
        setBalanceFrom(wallets[selectedWallet].balance.toString())
      } else if (tokenFrom.symbol !== 'WKAI') {
        const balance = await getKRC20Balance(tokenFrom.hash, wallets[selectedWallet].address)
        setBalanceFrom(balance)
      }
    })()
  }, [tokenFrom, wallets, selectedWallet])

  useEffect(() => {
    (async () => {
      if (!tokenTo) return;
      
      if (tokenTo.symbol === 'KAI') {
        setBalanceTo(wallets[selectedWallet].balance.toString())
      } else if (tokenTo.symbol !== 'WKAI') {
        const balance = await getKRC20Balance(tokenTo.hash, wallets[selectedWallet].address)
        setBalanceTo(balance.toString())

        const _approveState = await getApproveState(tokenTo, getDigit(amountTo), wallets[selectedWallet])
        setApprovedState(_approveState)
      }
    })()
  }, [tokenTo, wallets, selectedWallet])

  useEffect(() => {
    if (!volumeData || !volumeData.pairs) return
    const item = volumeData.pairs.find((it: any) => {
      return (it.id.toLowerCase() === pairItem.contract_address)
    })
    if (!item.volumeUSD) return
    setVolumeUSD(item.volumeUSD)

  }, [volumeData, pairItem])

  useEffect(() => {
    (async () => {
      if (!pairItem) return

      _tokenFrom = JSON.parse(JSON.stringify(formatDexToken(pairItem.t1)))
      setTokenFrom(formatDexToken(pairItem.t1));

      _tokenTo = JSON.parse(JSON.stringify(formatDexToken(pairItem.t2)))
      setTokenTo(formatDexToken(pairItem.t2));

      // Get liquidity
      const {reserveIn, reserveOut} = await getReserve(pairItem.t1.hash, pairItem.t2.hash)
      const parsedReserveIn = (new BigNumber(reserveIn)).dividedBy(new BigNumber(10 ** Number(pairItem.t1.decimals))).toFixed()
      const parsedReserveOut = (new BigNumber(reserveOut)).dividedBy(new BigNumber(10 ** Number(pairItem.t2.decimals))).toFixed()
      _tokenFromLiquidity = parsedReserveIn
      setTokenFromLiquidity(parsedReserveIn)
      _tokenToLiquidity = parsedReserveOut
      setTokenToLiquidity(parsedReserveOut)

      const balance = await getBalance(wallets[selectedWallet].address);
      const newWallets: Wallet[] = JSON.parse(JSON.stringify(wallets));
      newWallets.forEach((walletItem, index) => {
        if (walletItem.address === wallets[selectedWallet].address) {
          newWallets[index].balance = balance;
        }
      });
      await saveWallets(newWallets)
      setWallets(newWallets);
      setInited(true)
    })()
  }, [pairItem])

  useEffect(() => {
    (async () => {
      if (!_tokenFromLiquidity || !_tokenToLiquidity || !_tokenFrom || !_tokenTo) return;
      const _volume = await getTotalVolume(volumeUSD, pairItem.contract_address)
      setVolume(_volume.toString());

      const bnFrom = new BigNumber(_tokenFromLiquidity)
      const bnTo = new BigNumber(_tokenToLiquidity)
      const _rate = bnTo.dividedBy(bnFrom)
      setRate(_rate)
    })()
  }, [_tokenFromLiquidity, _tokenToLiquidity, volumeUSD])

  useEffect(() => {
    (async () => {
      if (editting === 'from' && rate && tokenFrom && tokenTo) {
        const _amountFrom = getDigit(amountFrom, false)
        if (_amountFrom === '0' || _amountFrom === '' || Number(_amountFrom) === 0) {
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

          const impact = await calculatePriceImpact(
            tokenTo,
            tokenFrom,
            getDigit(_newTo),
            getDigit(amountFrom)
          )

          setPriceImpact(impact)

          setAmountTo(formatNumberString(_newTo, tokenTo.decimals))
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
        if (_amountTo === '0' || _amountTo === '' || Number(_amountTo) === 0) {
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

          const impact = await calculatePriceImpact(
            tokenTo,
            tokenFrom,
            getDigit(amountTo),
            getDigit(_newFrom)
          )

          setPriceImpact(impact)

          setAmountFrom(formatNumberString(_newFrom, tokenFrom.decimals))
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
    setPriceImpact('0')

    if (mode === 'BUY') {
      setMode('SELL')
    } else {
      setMode('BUY')
    }
  }

  const handleApprove = async () => {
    if (!tokenFrom || !tokenTo) return;
    if (pendingTx) {
      Alert.alert(getLanguageString(language, 'HAS_PENDING_TX'));
      return;
    }
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

      if (isRecognizedError(error.message)) {
        setSwappError(parseError(error.message, language))
      } else {
        setSwappError(getLanguageString(language, 'APPROVE_ERROR'))
      }
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
        inputType,
        slippageTolerance,
        txDeadline: await calculateTransactionDeadline(txDeadline as string),
      }

      const txResult = await swapTokens(swapParams, _wallets[_selectedWallet])
      setProcessing(false)

      if (txResult) {
        setPendingTx(txResult)
        // Handling success tx
        setAmountFrom('0')
        setAmountTo('0')
        setSwappError('')
        onSuccess({
          mode, amountTo, amountFrom, txResult, isLimit: false
        })
      } else {
        // Handling fail tx
        console.log('Swap fail')
        console.log(swapParams)
        setSwappError(getLanguageString(language, 'SWAP_GENERAL_ERROR'))
      }

    } catch (error) {
      const ERROR_KEY = error.message ? getErrorKey(error.message) : 'SWAP_GENERAL_ERROR'
      setSwappError(getLanguageString(language, ERROR_KEY))
      setProcessing(false);
    }
  }

  const authForSubmitMarket = () => {
    let isValid = true;

    const wallet = wallets[selectedWallet];
    if (pendingTx && wallet.address) {
      Alert.alert(getLanguageString(language, 'HAS_PENDING_TX'));
      return
    }

    if (!isValid) return;

    setShowAuthModal(true)
  }

  const renderRate = () => {
    if (_tokenFrom && _tokenTo && rate) {
      return (
        <View style={{marginTop: 12, backgroundColor: theme.backgroundStrongColor, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8}}>
          <CustomText style={{color: theme.textColor}}>
            1{' '}
            <CustomText style={{color: theme.mutedTextColor}}>{_tokenFrom.symbol}</CustomText>{' '}={' '}
            {
              loadingFrom || loadingTo ? 
              <CustomText style={{color: theme.textColor}}> -- </CustomText>
              :
              <CustomText style={{color: theme.textColor}}>~ {formatNumberString(estimateRate().toFixed(), 6)}</CustomText>
            }
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
            slippageTolerance={slippageTolerance as string}
            deadline={txDeadline as string}
            onClose={() => {
              setShowTxSettingModal(false);
            }}
            onSubmit={(newDeadline, newSlippageTolerance) => {
              setTxDeadline(newDeadline);
              setSlippageTolerance(newSlippageTolerance);
              setShowTxSettingModal(false);
            }}
          />
          <CustomText style={{color: theme.textColor, textAlign: 'left', width: '100%', marginTop: 8}}>
            {getLanguageString(language, 'PRICE_IMPACT')}: {priceImpact} %
          </CustomText>
          <Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%'}} onPress={() => setShowTxSettingModal(true)}>
            <Image style={{width: 16, height: 16, marginRight: 4}} source={require('../../../assets/icon/setting_dark.png')} />
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
        <>
          <Button 
            title={getLanguageString(language, 'CANCEL')}
            onPress={onClose}
            block
            type="outline"
            style={{
              marginTop: 32,
            }}
          />
          <Button
            title={getLanguageString(language, 'ENTER_AMOUNT')}
            disabled={true}
            onPress={() => {}}
            style={{
              marginTop: 12,
              width: '100%',
            }}
            textStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        </>
      )
    }

    if (!approvedState) {
      return (
        <View
          style={{
            marginTop: 20,
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
            title={getLanguageString(language, 'CANCEL')}
            onPress={onClose}
            block
            type="outline"
            style={{
              marginTop: 8,
            }}
          />
          <Button
            title={getLanguageString(language, 'APPROVE')}
            loading={approving}
            disabled={approving}
            onPress={authForApprove}
            style={{
              marginTop: 12,
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
        <>
          <Button 
            title={getLanguageString(language, 'CANCEL')}
            onPress={onClose}
            block
            type="outline"
            style={{
              marginTop: 32,
            }}
          />
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
              marginTop: 12,
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
        </>
      )
    }
  }

  const shouldHighight = () => {
    if (!tokenTo) return false
    const val14 = parseDecimals(getPartial(balanceTo, 0.25, tokenTo.decimals), tokenTo.decimals)
    const val24 = parseDecimals(getPartial(balanceTo, 0.5, tokenTo.decimals), tokenTo.decimals)
    const val34 = parseDecimals(getPartial(balanceTo, 0.75, tokenTo.decimals), tokenTo.decimals)
    const val44 = parseDecimals(getPartial(balanceTo, 1, tokenTo.decimals), tokenTo.decimals)
    if (val14 === val24 || val14 === val34 || val14 === val44) return false
    if (val24 === val34 || val24 === val44) return false
    if (val34 === val44) return false
    return true
  }

  const isPercent = (amount: string, totalAmount: string, token: PairToken, percent: number) => {
    const digitOnly = getDigit(amount)
    const percentValue = getDigit(
      formatNumberString(
        parseDecimals(getPartial(totalAmount, percent, token.decimals), token.decimals),
        token.decimals
      )
    )
    return digitOnly === percentValue
  }

  if (showAuthModal) {
    return (
      <AuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
        }}
        onSuccess={onAuthSuccess}
      />
    )
  }

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: 28,
      }}
    >
      <View onStartShouldSetResponder={() => true}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View 
            style={{
              width: '100%',
              alignItems: 'center',
              paddingHorizontal: 16,
              // paddingTop: 24,
              paddingBottom: 12,
            }}>
            
            {tokenTo && (
              <View style={{width: '100%', marginTop: 12}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 6}}>
                  <CustomText 
                    style={{
                      color: theme.textColor,
                      fontSize: theme.defaultFontSize + 1,
                      fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
                      fontWeight: '500'
                    }}
                  >
                    {getLanguageString(language, 'FROM')}
                  </CustomText>
                  <CustomText style={{ color: theme.mutedTextColor, lineHeight: 20}}>
                    {getLanguageString(language, 'BALANCE')}:{' '}
                    <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceTo, tokenTo.decimals), 6)}</CustomText>
                  </CustomText>
                </View>
                
                <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
                  <CustomTextInput
                    value={amountTo}
                    keyboardType={Platform.OS === 'android' ? "decimal-pad" : "numbers-and-punctuation"}
                    editable={editting !== 'from'}
                    loading={loadingTo}
                    onChangeText={(newValue) => {
                      setInputType(0)
                      const digitOnly = getDigit(newValue, tokenTo.decimals === 0 ? false : true);
                      if (digitOnly === '') {
                        setAmountTo('0')
                      }
                      if (getDecimalCount(newValue) > tokenTo.decimals) {
                        return;
                      }
                    
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
                    active={balanceTo !== '0' && shouldHighight() && isPercent(amountTo, balanceTo, tokenTo, 0.25) } 
                    containerStyle={{marginRight: 12}} 
                    onPress={() => {
                      setEditting('to')
                      const partialValue = getPartial(balanceTo, 0.25, tokenTo.decimals)
                      setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals), tokenTo.decimals))
                    }} 
                  />
                  <Tags 
                    content={`50 %`} 
                    active={balanceTo !== '0' && shouldHighight() && isPercent(amountTo, balanceTo, tokenTo, 0.5) } 
                    containerStyle={{marginRight: 12}} 
                    onPress={() => {
                      setEditting('to')
                      const partialValue = getPartial(balanceTo, 0.5, tokenTo.decimals)
                      setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals), tokenTo.decimals))
                    }}
                  />
                  <Tags 
                    content={`75 %`} 
                    active={balanceTo !== '0' && shouldHighight() && isPercent(amountTo, balanceTo, tokenTo, 0.75) } 
                    containerStyle={{marginRight: 12}} 
                    onPress={() => {
                      setEditting('to')
                      const partialValue = getPartial(balanceTo, 0.75, tokenTo.decimals)
                      setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals), tokenTo.decimals))
                    }}
                  />
                  <Tags 
                    content={`100 %`} 
                    active={balanceTo !== '0' && shouldHighight() && isPercent(amountTo, balanceTo, tokenTo, 1) } 
                    onPress={() => {
                      setEditting('to')
                      
                      let partialValue = getPartial(balanceTo, 1, tokenTo.decimals)
                      if (tokenTo.symbol === 'KAI') {
                        const bnPartialValue = new BigNumber(partialValue)
                        const ONE_KAI = new BigNumber(10 ** 18)
                        // const bn110KAI = new BigNumber(10 ** (tokenTo.decimals))
                        const bn110KAI = new BigNumber(partialValue).multipliedBy(new BigNumber(0.1))
                        if (bnPartialValue.isGreaterThan(ONE_KAI)) {
                          partialValue = bnPartialValue.minus(new BigNumber(10 ** 16)).toFixed(tokenTo.decimals, 1)
                        } else {
                          partialValue = bnPartialValue.minus(bn110KAI).toFixed(tokenTo.decimals, 1)
                        }
                      }
                      setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals), tokenTo.decimals))
                    }} 
                  />
                </View>
                
                <CustomText style={{marginTop: 2, color: theme.mutedTextColor, lineHeight: 20}}>
                  Liquidity:{' '}
                  <CustomText style={{color: theme.textColor}}>
                    {formatNumberString(tokenToLiquidity, 6)}
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
                      source={require('../../../assets/icon/swap_dark.png')}
                      style={{width: 16, height: 16}}
                    />
                  </TouchableOpacity>
                </View>
              )
            }
            {tokenFrom && (
              <View style={{width: '100%'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 6}}>
                  <CustomText 
                    style={{
                      color: theme.textColor,
                      fontSize: theme.defaultFontSize + 1,
                      fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
                      fontWeight: '500'
                    }}
                  >
                    {getLanguageString(language, 'TO')}
                  </CustomText>
                  <CustomText style={{color: theme.mutedTextColor, lineHeight: 20}}>
                    {getLanguageString(language, 'BALANCE')}:{' '}
                    <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceFrom, tokenFrom.decimals), 6)}</CustomText>
                  </CustomText>
                </View>
                <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
                  <CustomTextInput
                    value={amountFrom}
                    keyboardType={Platform.OS === 'android' ? "decimal-pad" : "numbers-and-punctuation"}
                    loading={loadingFrom}
                    onChangeText={(newValue) => {
                      setInputType(1)
                      const digitOnly = getDigit(newValue, tokenFrom.decimals === 0 ? false : true);
                      if (digitOnly === '') {
                        setAmountFrom('0')
                      }
                      if (getDecimalCount(newValue) > tokenFrom.decimals) {
                        return;
                      }
                      if (new BigNumber(digitOnly).isGreaterThan(new BigNumber(tokenFromLiquidity))) {
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
                
                <CustomText style={{marginTop: 2, color: theme.mutedTextColor, lineHeight: 20}}>
                  Liquidity:{' '}
                  <CustomText style={{color: theme.textColor}}>
                    {formatNumberString(tokenFromLiquidity, 6)}
                  </CustomText>
                </CustomText>
              </View>
            )}
            {renderRate()}
            {renderSetting()}
            {inited && _tokenFrom && _tokenTo && rate ? 
              renderButton() : 
              <ActivityIndicator color={theme.textColor} size="large" />
            }
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
        </TouchableWithoutFeedback>
      </View>
    </View>
  )
}