import { useNavigation, useRoute } from '@react-navigation/core';
import ENIcon from 'react-native-vector-icons/Entypo';
import AntIcon from 'react-native-vector-icons/AntDesign';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../../ThemeContext';
import CustomText from '../../../components/Text';
import numeral from 'numeral';
import { formatDexToken, get24hPairData, getReserve, getTotalVolume } from '../../../services/dex';
import { useFocusEffect } from '@react-navigation/native';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { statusBarColorAtom } from '../../../atoms/statusBar';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import Button from '../../../components/Button';
import { getLanguageString } from '../../../utils/lang';
import { languageAtom } from '../../../atoms/language';
import MarketHistorySection from './MarketHistorySection';
import TradeModal from './TradeModal';
import { formatNumberString, getDigit } from '../../../utils/number';
import { favoritePairsAtom } from '../../../atoms/favoritePairs';
import ChartSection from './ChartSection';
import BigNumber from 'bignumber.js';
import { useQuery } from '@apollo/client';
import { GET_PAIRS } from '../../../services/dex/queries';
import Toast from 'react-native-toast-message';

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const {params} = useRoute()
  const pairItem: Pair = params ? (params as any).pairItem : {}

  const { data: volumeData, refetch } = useQuery(GET_PAIRS, {fetchPolicy: 'no-cache'});
  const insets = useSafeAreaInsets();

  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);
  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const [favoritePair, setFavoritePair] = useRecoilState(favoritePairsAtom)

  const [showTradeModal, setShowTradeModal] = useState(false)

  const [price24h, setPrice24h] = useState('')
  const [price, setPrice] = useState('')
  const [volume24h, setVolume24h] = useState('')
  const [reserve0, setReserve0] = useState('')
  const [reserve1, setReserve1] = useState('')

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundStrongColor);
      setTabBarVisible(false);
      // return () => {
      //   setStatusBarColor(theme.backgroundColor)
      // }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      const [pCurrent, p24h] = await Promise.all([getCurrentPrice(), get24hPrice()])
      setPrice(pCurrent)
      setPrice24h(p24h)
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (!volumeData || !volumeData.pairs) return
      const item = volumeData.pairs.find((it: any) => {
        return (it.id.toLowerCase() === pairItem.contract_address)
      })
      if (!item.volumeUSD) return
      const volume = await getTotalVolume(item.volumeUSD, pairItem.contract_address)
      setVolume24h(new BigNumber(volume).toFixed())
    })()
  }, [volumeData, pairItem])

  const get24hPrice = async () => {
    const pairData = await get24hPairData(pairItem.contract_address)
    if (!pairData) return pairData
    if (pairItem.invert) {
      return pairData.token0Price
    } else {
      return pairData.token1Price
    }
  }

  const getCurrentPrice = async () => {
    const {reserveIn, reserveOut} = await getReserve(pairItem.t1.hash, pairItem.t2.hash)
    
    const _tokenFromLiquidity = (new BigNumber(reserveIn)).dividedBy(new BigNumber(10 ** Number(pairItem.t1.decimals))).toFixed()
    const _tokenToLiquidity = (new BigNumber(reserveOut)).dividedBy(new BigNumber(10 ** Number(pairItem.t2.decimals))).toFixed()

    setReserve0(_tokenFromLiquidity)
    setReserve1(_tokenToLiquidity)

    const bnFrom = new BigNumber(_tokenFromLiquidity)
    const bnTo = new BigNumber(_tokenToLiquidity)
    const _rate = bnTo.dividedBy(bnFrom)
    return _rate.toFixed()
  }

  const isFav = () => {
    return favoritePair.map((add) => add.toLowerCase()).includes(pairItem.contract_address.toLowerCase())
  }

  const toggleFav = () => {
    const _newFavList: string[] = JSON.parse(JSON.stringify(favoritePair))
    if (isFav()) {
      setFavoritePair(_newFavList.filter((add) => add !== pairItem.contract_address))
    } else {
      _newFavList.push(pairItem.contract_address.toLowerCase())
      setFavoritePair(_newFavList)
    }
  }

  const renderPriceChange = () => {
    if (!price || !price24h) {
      return (
        <CustomText 
          style={{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3,
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        >
          --
        </CustomText>
      )
    }
    const priceCurrentBN = new BigNumber(price)
    const price24hBN = new BigNumber(price24h)

    let color = theme.increaseColor
    let changeValue = priceCurrentBN.minus(price24hBN)
    if (priceCurrentBN.isLessThan(price24hBN)) {
      color = theme.decreaseColor
      changeValue = price24hBN.minus(priceCurrentBN)
    }

    const changeInPercent = changeValue.dividedBy(price24hBN).multipliedBy(100)

    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <AntIcon 
          name={color === theme.increaseColor ? "caretup" : "caretdown"} 
          style={{
            color: color, 
            marginRight: 4, 
            paddingTop: color === theme.increaseColor ? 2 : 0,
            paddingBottom: color === theme.decreaseColor ? 2 : 0,
          }} 
          size={10} 
        />
        <CustomText 
          style={{
            color: color, 
            fontSize: theme.defaultFontSize + 3,
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        >
          {changeInPercent.toFixed(2)} %
        </CustomText>
      </View>
    )
  }

  const renderVolume24h = () => {
    return (
      <CustomText 
        style={{
          color: theme.textColor,
          fontSize: theme.defaultFontSize + 3,
          fontWeight: '500',
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
        }}
      >
        {volume24h ? `$ ${formatNumberString(volume24h, 2)}` : '--'}
      </CustomText>
    )
  }

  return (
    <View style={{backgroundColor: theme.backgroundColor, flex: 1, paddingBottom: insets.bottom}}>
      <TradeModal
        visible={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        pairItem={pairItem}
        onSuccess={({mode, amountTo, amountFrom, txResult, isLimit = false }) => {
          if (isLimit) {
            // Toast.show({
            //   type: 'success',
            //   topOffset: 70,
            //   text1: getLanguageString(language, 'LIMIT_ORDER_CREATED'),
            // });
            navigation.navigate('SuccessTx', {
              type: 'dexLimit',
              pairAddress: pairItem.contract_address,
              dexAmount: mode === 'SELL' ? getDigit(amountTo) : getDigit(amountFrom),
              tokenSymbol: formatDexToken(pairItem.t1).symbol,
              dexMode: `DEX_MODE_${mode}`,
              txHash: typeof txResult === 'string' ? txResult : txResult.transactionHash,
              pairItem,
            });
          } else {
            navigation.navigate('SuccessTx', {
              type: 'dex',
              pairAddress: pairItem.contract_address,
              dexAmount: mode === 'SELL' ? getDigit(amountTo) : getDigit(amountFrom),
              tokenSymbol: formatDexToken(pairItem.t1).symbol,
              dexMode: `DEX_MODE_${mode}`,
              txHash: typeof txResult === 'string' ? txResult : txResult.transactionHash,
              pairItem,
            });
          }
          setShowTradeModal(false)
        }}
      />
      <View 
        style={{
          paddingHorizontal: 20, 
          width: '100%', 
          backgroundColor: theme.backgroundStrongColor,
          paddingTop: Platform.OS === 'android' ? 18 : insets.top,
          // paddingBottom: 18,
          // borderBottomLeftRadius: 12,
          // borderBottomRightRadius: 12
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
            <ENIcon.Button
              name="chevron-left"
              onPress={() => navigation.goBack()}
              backgroundColor="transparent"
              style={{paddingHorizontal: 0}}
            />
            <View style={{flexDirection: 'row', marginRight: 12}}>
              <View style={{width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16}}>
                <Image
                  source={{uri: pairItem.t1.logo}}
                  style={{width: 32, height: 32}}
                />
              </View>
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
                  source={{uri: pairItem.t2.logo}}
                  style={{width: 32, height: 32}}
                />
              </View>
            </View>
            <CustomText 
              style={{
                color: theme.textColor, 
                fontSize: theme.defaultFontSize + 7,
                fontWeight: '500',
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
              }}
            >
              {formatDexToken(pairItem.t1).symbol} / {formatDexToken(pairItem.t2).symbol}
            </CustomText>
          </View>
          <TouchableOpacity
            onPress={toggleFav}
          >
            <AntIcon
              name="star"
              size={20}
              color={isFav() ? 'rgba(247, 169, 0, 1)' : theme.backgroundFocusColor}
            />
          </TouchableOpacity>
        </View>
        <View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {/* Stat section */}
            <View style={{padding: 10}}>
              <CustomText 
                style={{
                  color: theme.mutedTextColor, 
                  marginBottom: 4, 
                  fontSize: theme.defaultFontSize,
                  fontWeight: '500',
                  fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                }}
              >
                  24h Price Change
              </CustomText>
              {renderPriceChange()}
            </View>
            <View style={{padding: 10}}>
              <CustomText 
                style={{
                  color: theme.mutedTextColor, 
                  marginBottom: 4, 
                  fontSize: theme.defaultFontSize,
                  fontWeight: '500',
                  fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                }}
              >
                24h Volume
              </CustomText>
              {renderVolume24h()}
            </View>
            <View style={{padding: 10}}>
              <View
                style={{flexDirection: 'row'}}
              >
                <Image
                  source={{uri: pairItem.t1.logo}}
                  style={{width: 18, height: 18, marginRight: 6}}
                />
                <CustomText 
                  style={{
                    color: theme.textColor, 
                    marginBottom: 4, 
                    fontSize: theme.defaultFontSize + 2,
                    fontWeight: '500',
                    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                  }}
                >
                  {reserve0 ? numeral(reserve0).format('0.0a') : '--'} {formatDexToken(pairItem.t1).symbol}
                </CustomText>
              </View>
              <View
                style={{flexDirection: 'row'}}
              >
                <Image
                  source={{uri: pairItem.t2.logo}}
                  style={{width: 18, height: 18, marginRight: 6}}
                />
                <CustomText 
                  style={{
                    color: theme.textColor, 
                    marginBottom: 4, 
                    fontSize: theme.defaultFontSize + 2,
                    fontWeight: '500',
                    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                  }}
                >
                  {reserve1 ? numeral(reserve1).format('0.0a') : '--'} {formatDexToken(pairItem.t2).symbol}
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      </View>
      <ScrollView 
        style={{
          flex: 1,
        }}
      >
        <ChartSection pairItem={pairItem} />
        <MarketHistorySection pairItem={pairItem} />
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 32,
          backgroundColor: theme.backgroundStrongColor,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
      >
        {/* Bottom Button section */}
        <Button
          title={getLanguageString(language, 'TRADE')}
          onPress={() => setShowTradeModal(true)}
          textStyle={{
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        />
      </View>
    </View>
  )
}