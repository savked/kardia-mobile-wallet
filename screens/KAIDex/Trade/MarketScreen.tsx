import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import TxSettingModal from '../TxSettingModal'
import Button from '../../../components/Button';
import Divider from '../../../components/Divider';
import CustomText from '../../../components/Text';
import CustomTextInput from '../../../components/TextInput';
import { approveToken, calculateDexAmountOut, calculatePriceImpact, calculateTransactionDeadline, formatDexToken, getApproveState, getTotalVolume } from '../../../services/dex';
import { getBalance as getKRC20Balance } from '../../../services/krc20';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString, parseError } from '../../../utils/lang';
import { getSelectedWallet, getWallets, saveWallets } from '../../../utils/local';
import { formatNumberString, getDecimalCount, getDigit, getPartial, isNumber, parseDecimals } from '../../../utils/number';
import { swapTokens } from '../../../services/dex';
import { useNavigation } from '@react-navigation/core';
import Tags from '../../../components/Tags';
import AuthModal from '../../common/AuthModal';
import { getErrorKey, isRecognizedError } from '../../../utils/error';
import { cacheSelector } from '../../../atoms/cache';
import SelectingPair from './SelectingPair';
import { useQuery } from '@apollo/client';
import { GET_PAIRS } from '../../../services/dex/queries';
import { getBalance } from '../../../services/account';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import { pairMapper } from '../../../utils/dex';

let _tokenFrom: PairToken
let _tokenTo: PairToken
let _tokenFromLiquidity: string
let _tokenToLiquidity: string

export default ({
  toggleMenu,
  params
}: {
  params: any;
  toggleMenu: () => void;
}) => {
  const navigation = useNavigation()
  const [wallets, setWallets] = useRecoilState(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom)
  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  
  const [volumeUSD, setVolumeUSD] = useState('') //
  const [pairAddress, setPairAddress] = useState(''); //
  const [pairData, setPairData] = useState({pairs: [] as any[]}) //
  const [selectingPair, setSelectingPair] = useState(false) //
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

  const [refreshing, setRefreshing] = useState(false); //
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

  const [rate, setRate] = useState<BigNumber | number>();
  // const [txDeadline, setTxDeadline] = useState('2')
  const [txDeadline, setTxDeadline] = useRecoilState(cacheSelector('txDeadline'))
  // const [slippageTolerance, setSlippageTolerance] = useState('1')
  const [slippageTolerance, setSlippageTolerance] = useRecoilState(cacheSelector('slippageTolerance'))

  const [showTxSettingModal, setShowTxSettingModal] = useState(false)
  const [swapError, setSwappError] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  // const [onAuthSuccess, setOnAuthSuccess] = useState<() => void>(() => {})
  const [priceImpact, setPriceImpact] = useState('0');

  const { loading, error, data: _pairData, refetch } = useQuery(GET_PAIRS, {fetchPolicy: 'no-cache'});

  const onAuthSuccess = () => {
    if (!approvedState) {
      handleApprove()
    } else {
      handleSubmitMarket()
    }
  }


  useEffect(() => {
    if (!selectingPair) {
      setTabBarVisible(true)
    }
  }, [selectingPair])

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
    if (!params || loading || error) return;
    if (!pairData.pairs) return;
    const _pairAddress = (params as any).pairAddress
    if (_pairAddress) {
      refetch()
    }
  }, [params])

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
    if (!params || loading || error) return;
    if (!pairData.pairs) return;
    const _pairAddress = (params as any).pairAddress
    if (_pairAddress) {
      refetch()
    }
  }, [params])

  useEffect(() => {
    (async () => {
      // if (params) return
      if (pairData && pairData.pairs) {
        let pair = pairData.pairs[0]

        if (params) {
          const _pairAddress = (params as any).pairAddress

          const item = pairData.pairs.find((i: any) => {
            return i.contract_address === _pairAddress
          })

          if (item) pair = item
        }

        if (!pair) return

        _tokenFrom = JSON.parse(JSON.stringify(formatDexToken(pair.t1)))
        setTokenFrom(formatDexToken(pair.t1));

        _tokenTo = JSON.parse(JSON.stringify(formatDexToken(pair.t2)))
        setTokenTo(formatDexToken(pair.t2));

        _tokenFromLiquidity = pair.token1_liquidity
        setTokenFromLiquidity(pair.token1_liquidity);

        _tokenToLiquidity = pair.token2_liquidity
        setTokenToLiquidity(pair.token2_liquidity)

        setPairAddress(pair.contract_address)
        setVolumeUSD(pair.volumeUSD)
        setSelectingPair(false)

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
      }
    })()
  }, [pairData, params])

  useEffect(() => {
    if (!_pairData || !_pairData.pairs) return
    setPairData({
      pairs: pairMapper(_pairData.pairs)
    })
  }, [_pairData])

  useEffect(() => {
    (async () => {
      if (!_tokenFromLiquidity || !_tokenToLiquidity || !pairAddress || !_tokenFrom || !_tokenTo) return;
      const _volume = await getTotalVolume(volumeUSD, pairAddress)
      setVolume(_volume.toString());

      const bnFrom = new BigNumber(_tokenFromLiquidity)
      const bnTo = new BigNumber(_tokenToLiquidity)
      const _rate = bnTo.dividedBy(bnFrom)
      setRate(_rate)
    })()
  }, [_tokenFromLiquidity, _tokenToLiquidity])

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

          setAmountTo(formatNumberString(_newTo, 6))
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

          setAmountFrom(formatNumberString(_newFrom, 6))
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
        // Handling success tx
        setAmountFrom('0')
        setAmountTo('0')
        setSwappError('')
        navigation.navigate('SuccessTx', {
          type: 'dex',
          pairAddress,
          dexAmount: mode === 'SELL' ? getDigit(amountTo) : getDigit(amountFrom),
          tokenSymbol: mode === 'SELL' ? tokenTo.symbol : tokenFrom.symbol,
          dexMode: `DEX_MODE_${mode}`,
          txHash: typeof txResult === 'string' ? txResult : txResult.transactionHash
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
            <CustomText style={{color: theme.textColor}}>~ {formatNumberString(rate.toFixed(), 6)}</CustomText>
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

  if (selectingPair) {
    return (
      <SelectingPair
        pairData={pairData}
        loading={loading}
        goBack={() => {
          setSelectingPair(false)
          toggleMenu()
        }}
        onSelect={(from: PairToken, to: PairToken, liquidityFrom, liquidityTo, pairAddress, volumeUSD) => {
          _tokenFrom = JSON.parse(JSON.stringify(from))
          setTokenFrom(from);
          _tokenTo = JSON.parse(JSON.stringify(to))
          setTokenTo(to);
          setSelectingPair(false);
          _tokenFromLiquidity = liquidityFrom
          setTokenFromLiquidity(liquidityFrom);
          _tokenToLiquidity = liquidityTo
          setTokenToLiquidity(liquidityTo)
          setPairAddress(pairAddress)
          setVolumeUSD(volumeUSD)
          toggleMenu()
        }}
      />
    )
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        paddingBottom: 28
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.textColor]}
          tintColor={theme.textColor}
          titleColor={theme.textColor}
        />
      }
    >
      <View onStartShouldSetResponder={() => true}>
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
            onPress={() => {
              toggleMenu()
              setSelectingPair(true)
            }}
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
              source={require('../../../assets/icon/chevron-right.png')}
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
                  active={balanceTo !== '0' && shouldHighight() && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 0.25, tokenTo.decimals), tokenTo.decimals) } 
                  containerStyle={{marginRight: 12}} 
                  onPress={() => {
                    setEditting('to')
                    const partialValue = getPartial(balanceTo, 0.25, tokenTo.decimals)
                    setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals), tokenTo.decimals))
                  }} 
                />
                <Tags 
                  content={`50 %`} 
                  active={balanceTo !== '0' && shouldHighight() && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 0.5, tokenTo.decimals), tokenTo.decimals) } 
                  containerStyle={{marginRight: 12}} 
                  onPress={() => {
                    setEditting('to')
                    const partialValue = getPartial(balanceTo, 0.5, tokenTo.decimals)
                    setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals), tokenTo.decimals))
                  }}
                />
                <Tags 
                  content={`75 %`} 
                  active={balanceTo !== '0' && shouldHighight() && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 0.75, tokenTo.decimals), tokenTo.decimals) } 
                  containerStyle={{marginRight: 12}} 
                  onPress={() => {
                    setEditting('to')
                    const partialValue = getPartial(balanceTo, 0.75, tokenTo.decimals)
                    setAmountTo(formatNumberString(parseDecimals(partialValue, tokenTo.decimals), tokenTo.decimals))
                  }}
                />
                <Tags 
                  content={`100 %`} 
                  active={balanceTo !== '0' && shouldHighight() && getDigit(amountTo) === parseDecimals(getPartial(balanceTo, 1, tokenTo.decimals), tokenTo.decimals) } 
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
              <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
                {getLanguageString(language, 'BALANCE')}:{' '}
                <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceTo, tokenTo.decimals), 6)}</CustomText>
              </CustomText>
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
              <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
                {getLanguageString(language, 'BALANCE')}:{' '}
                <CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balanceFrom, tokenFrom.decimals), 6)}</CustomText>
              </CustomText>
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
      </View>
    </ScrollView>
  )
}