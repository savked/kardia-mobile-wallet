import { useNavigation, useRoute } from '@react-navigation/core';
import ENIcon from 'react-native-vector-icons/Entypo';
import AntIcon from 'react-native-vector-icons/AntDesign';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../../ThemeContext';
import CustomText from '../../../components/Text';
import { formatDexToken } from '../../../services/dex';
import { useFocusEffect } from '@react-navigation/native';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { statusBarColorAtom } from '../../../atoms/statusBar';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import Button from '../../../components/Button';
import { getLanguageString } from '../../../utils/lang';
import { languageAtom } from '../../../atoms/language';
import MarketHistorySection from './MarketHistorySection';
import TradeModal from './TradeModal';
import { getDigit } from '../../../utils/number';
import { favoritePairsAtom } from '../../../atoms/favoritePairs';
//@ts-ignore
import ChartSection from './ChartSection';

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const {params} = useRoute()
  const pairItem: Pair = params ? (params as any).pairItem : {}

  const insets = useSafeAreaInsets();

  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);
  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const [favoritePair, setFavoritePair] = useRecoilState(favoritePairsAtom)

  const [showTradeModal, setShowTradeModal] = useState(false)

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

  return (
    <View style={{backgroundColor: theme.backgroundColor, flex: 1, paddingBottom: insets.bottom}}>
      <TradeModal
        visible={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        pairItem={pairItem}
        onSuccess={({mode, amountTo, amountFrom, txResult }) => {
          navigation.navigate('SuccessTx', {
            type: 'dex',
            pairAddress: pairItem.contract_address,
            dexAmount: mode === 'SELL' ? getDigit(amountTo) : getDigit(amountFrom),
            tokenSymbol: mode === 'SELL' ? formatDexToken(pairItem.t1).symbol : formatDexToken(pairItem.t2).symbol,
            dexMode: `DEX_MODE_${mode}`,
            txHash: typeof txResult === 'string' ? txResult : txResult.transactionHash,
            pairItem,
          });

          setShowTradeModal(false)
        }}
      />
      <View 
        style={{
          flexDirection: 'row', 
          paddingHorizontal: 20, 
          width: '100%', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.backgroundStrongColor,
          paddingTop: Platform.OS === 'android' ? 18 : insets.top,
          paddingBottom: 18,
          // borderBottomLeftRadius: 12,
          // borderBottomRightRadius: 12
        }}
      >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ENIcon.Button
            name="chevron-left"
            onPress={() => navigation.goBack()}
            backgroundColor="transparent"
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
      <ScrollView 
        style={{
          flex: 1,
        }}
      >
        <View>
          {/* Stat section */}
        </View>
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