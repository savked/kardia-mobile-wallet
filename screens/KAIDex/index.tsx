import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, RefreshControl, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../atoms/showTabBar';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import ExchangeScreen from './LimitScreen';
import SelectingPair from './SelectingPair';
import MarketScreen from './MarketScreen';
import { getLanguageString } from '../../utils/lang';
import { languageAtom } from '../../atoms/language';
import { useQuery } from '@apollo/client';
import { GET_PAIRS } from '../../services/dex/queries';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import { formatDexToken } from '../../services/dex';
import UnderMaintainence from '../common/UnderMaintainence';
import { dexStatusAtom } from '../../atoms/dexStatus';
import ComingSoon from '../common/ComingSoon';
import { statusBarColorAtom } from '../../atoms/statusBar';

export default () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const {params} = useRoute();

  const [type, setType] = useState('MARKET');
  const [selectingPair, setSelectingPair] = useState(false)
  const [refreshing, setRefreshing] = useState(false);

  const [tokenFrom, setTokenFrom] = useState<PairToken>()
  const [tokenFromLiquidity, setTokenFromLiquidity] = useState('');
  const [tokenTo, setTokenTo] = useState<PairToken>()
  const [tokenToLiquidity, setTokenToLiquidity] = useState('');
  const [pairAddress, setPairAddress] = useState('');
  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const dexStatus = useRecoilValue(dexStatusAtom)

  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const { loading, error, data: pairData, refetch } = useQuery(GET_PAIRS);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!params || loading || error) return;
    if (!pairData.pairs) return;
    const _pairAddress = (params as any).pairAddress
    if (_pairAddress) {
      refetch()
    }
    // setPairAddress(_pairAddress)

    // const item = pairData.pairs.find((i: any) => {
    //   return i.contract_address === _pairAddress
    // })

    // if (!item) return;
    // setTokenFrom(formatDexToken(item.t1, wallets[selectedWallet]));
    // setTokenTo(formatDexToken(item.t2, wallets[selectedWallet]));
    // setTokenFromLiquidity(item.token1_liquidity);
    // setTokenToLiquidity(item.token2_liquidity)
    // setPairAddress(item.contract_address)
    // setSelectingPair(false)
  }, [params])

  useEffect(() => {
    // if (params) return
    if (pairData && pairData.pairs) {
      let pair = pairData.pairs[0]

      const _pairAddress = (params as any).pairAddress

      const item = pairData.pairs.find((i: any) => {
        return i.contract_address === _pairAddress
      })

      if (item) pair = item

      if (!pair) return
      setTokenFrom(formatDexToken(pair.t1, wallets[selectedWallet]));
      setTokenTo(formatDexToken(pair.t2, wallets[selectedWallet]));
      setTokenFromLiquidity(pair.token1_liquidity);
      setTokenToLiquidity(pair.token2_liquidity)
      setPairAddress(pair.contract_address)
      setSelectingPair(false)
    }
  }, [pairData, params])

  useEffect(() => {
    if (!selectingPair) {
      setTabBarVisible(true)
    }
  }, [selectingPair])

  if (dexStatus === 'OFFLINE') {
    return <UnderMaintainence />
  }

  if (dexStatus === 'COMING_SOON') {
    return <ComingSoon />
  }

  if (selectingPair) {
    return (
      <SelectingPair
        pairData={pairData}
        loading={loading}
        goBack={() => setSelectingPair(false)}
        onSelect={(from: PairToken, to: PairToken, liquidityFrom, liquidityTo, pairAddress) => {
          setTokenFrom(from);
          setTokenTo(to);
          setSelectingPair(false);
          setTokenFromLiquidity(liquidityFrom);
          setTokenToLiquidity(liquidityTo)
          setPairAddress(pairAddress)
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
    <SafeAreaView style={{backgroundColor: theme.backgroundColor, flex: 1, paddingHorizontal: 20}}>
      {/* <ExchangeScreen /> */}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{flex: 1}}>
          <View style={{width: '100%', alignItems: 'center'}}>
            <View style={{borderRadius: 12, borderColor: 'rgba(96, 99, 108, 1)', borderWidth: 1.5, padding: 4, flexDirection: 'row', marginBottom: 32}}>
              <TouchableOpacity 
                style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'MARKET' ? theme.backgroundFocusColor : 'transparent'}}
                onPress={() => setType('MARKET')}
              >
                <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'MARKET' ? '500' : undefined, fontFamily: type === 'MARKET' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
                  {getLanguageString(language, 'MARKET_TITLE')}
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'LIMIT' ? theme.backgroundFocusColor : 'transparent'}}
                onPress={() => setType('LIMIT')}
              >
                <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'LIMIT' ? '500' : undefined, fontFamily: type === 'LIMIT' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
                  {getLanguageString(language, 'LIMIT_TITLE')}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                flex: 1,
              }}
              contentContainerStyle={{
                paddingBottom: 12
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
              {type === 'MARKET' ? 
                <MarketScreen 
                  triggerSelectPair={() => setSelectingPair(true)} 
                  tokenFrom={tokenFrom}
                  tokenTo={tokenTo}
                  tokenFromLiquidity={tokenFromLiquidity}
                  tokenToLiquidity={tokenToLiquidity}
                  pairAddress={pairAddress}
                /> 
                : 
                <ExchangeScreen />}
              </View>
            </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
};