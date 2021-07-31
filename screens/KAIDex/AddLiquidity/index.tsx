import { useQuery } from '@apollo/client';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, View, Image, Platform, TouchableOpacity } from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import List from '../../../components/List';
import CustomText from '../../../components/Text';
import { getMyPortfolio, getPairs } from '../../../services/dex';
import { GET_PAIRS } from '../../../services/dex/queries';
import { ThemeContext } from '../../../ThemeContext';
import { pairMapper } from '../../../utils/dex';
import AddLiquidityModal from '../../common/AddLiquidityModal';
import ComingSoon from '../../common/ComingSoon';
import Icon from 'react-native-vector-icons/Ionicons'
import LiquidityItem from './LiquidityItem';
import SelectPairForLP from './SelectPairForLP';
import LPDetailModal from '../../common/LPDetailModal';
import { getLanguageString } from '../../../utils/lang';
import { languageAtom } from '../../../atoms/language';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DEXHeader from '../../common/DEXHeader';
import { statusBarColorAtom } from '../../../atoms/statusBar';

export default () => {
  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const [lpList, setLPList] = useState<any[]>([])
  const [lpItemForDetail, setLPItemForDetail] = useState<any>()
  const [showNewLPModal, setShowNewLPModal] = useState(false)
  const [pairForNewLP, setPairForNewLP] = useState<Pair>()
  const [selectingPair, setSelectingPair] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [_pairData, set_PairData] = useState({pairs: [] as any[]}) //
  const [loading, setLoading] = useState(false);

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const [showLPDetailModal, setShowLPDetailModal] = useState(false)

  const [showMenu, setShowMenu] = useState(true);
  const insets = useSafeAreaInsets();
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  // const { loading, error, data: _pairData, refetch } = useQuery(GET_PAIRS, {fetchPolicy: 'no-cache'});

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const fetchPairData = async () => {
    try {
      const rs = await getPairs()
      if (rs) {
        set_PairData(rs)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true)
      await fetchPairData()
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (_pairData && _pairData.pairs && _pairData.pairs.length > 0) {
        const rs = await getMyPortfolio(pairMapper(_pairData.pairs), wallets[selectedWallet].address)
        setLPList(rs)
      }
    })()
  }, [wallets, selectedWallet, _pairData])

  const handleRefresh = async () => {
    if (_pairData && _pairData.pairs && _pairData.pairs.length > 0) {
      setShowNewLPModal(false)
      setShowLPDetailModal(false)
      setIsRefreshing(true)
      const rs = await getMyPortfolio(pairMapper(_pairData.pairs), wallets[selectedWallet].address)
      setLPList(rs)
      setIsRefreshing(false)
    }
  }

  const triggerAddLP = (pairAddress: string) => {
    const allPair = pairMapper(_pairData.pairs)
    const item = allPair.find((i) => i.contract_address === pairAddress)
    if (item) {
      // setShowLPDetailModal(false)
      setPairForNewLP(item)
      setShowNewLPModal(true)
    }
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundStrongColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  if (selectingPair && _pairData && _pairData.pairs && _pairData.pairs.length > 0) {
    return (
      <SelectPairForLP
        goBack={() => {
          toggleMenu()
          setTabBarVisible(true)
          setSelectingPair(false)
        }}
        pairData={pairMapper(_pairData.pairs)}
        loading={loading}
        onSelect={(pair: Pair) => {
          setTabBarVisible(true)
          setPairForNewLP(pair)
          setShowNewLPModal(true)
          setSelectingPair(false)
          toggleMenu()
        }}
      />
    )
  }

  return (
    <View style={{
      backgroundColor: theme.backgroundColor, 
      flex: 1, 
      // paddingHorizontal: 20, 
      // paddingTop: 28 + insets.top
    }}>
      <AddLiquidityModal
        visible={showNewLPModal}
        onClose={() => {
          setShowNewLPModal(false)
        }}
        pair={pairForNewLP}
        refreshLP={handleRefresh}
        closeDetail={() => {
          if (showLPDetailModal) {
            setShowLPDetailModal(false)
          }
        }}
      />
      <LPDetailModal
        visible={showLPDetailModal}
        onClose={() => setShowLPDetailModal(false)}
        lpItem={lpItemForDetail}
        triggerAddLP={triggerAddLP}
        refreshLP={handleRefresh}
      />
      <View
        style={{
          flex: 1
        }}
      >
        <DEXHeader
          type="LIQUIDITY"
        />
        {
          !loading && lpList.length > 0 && (
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 8,
                paddingHorizontal: 20
              }}
            >
              <CustomText 
                style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 6}}
              >
                My Porfolio
              </CustomText>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() => {
                  toggleMenu()
                  setSelectingPair(true)
                }}
              >
                <Icon
                  name="add"
                  color={theme.textColor}
                  size={20}
                />
                <CustomText style={{color: theme.textColor}}>
                  {getLanguageString(language, 'ADD_LP')}
                </CustomText>
              </TouchableOpacity>
            </View>
          )
        }
        <View style={{flex: 1}}>
          <List
            items={lpList}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            loading={loading}
            loadingColor={theme.textColor}
            keyExtractor={(item, index) => index.toString()}
            listStyle={{
              flex: 1,
            }}
            containerStyle={{
              paddingBottom: 16,
              marginHorizontal: 20
            }}
            ListEmptyComponent={
              <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Image
                  source={require('../../../assets/no_liquidity.png')}
                  style={{
                    width: 211,
                    height: 200
                  }}
                />
                <CustomText
                  style={{
                    color: theme.textColor,
                    marginTop: 32,
                    fontWeight: 'bold',
                    fontSize: theme.defaultFontSize + 12
                  }}
                >
                  No Liquidity
                </CustomText>
                <CustomText
                  style={{
                    color: theme.mutedTextColor,
                    marginTop: 12,
                    marginBottom: 32,
                    fontWeight: '500',
                    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
                    fontSize: theme.defaultFontSize + 3,
                    textAlign: 'center'
                  }}
                >
                  Start earning on each transaction by adding your own token pairs
                </CustomText>
                <Button
                  title={"Add Liquidity"}
                  onPress={() => {
                    toggleMenu()
                    setSelectingPair(true)
                  }}
                  icon={
                    <AntIcon
                      name="plus"
                      size={20}
                      color={'#000000'}
                      style={{marginRight: 8}}
                    />
                  }
                  style={{width: 192}}
                  textStyle={{
                    fontWeight: '500',
                    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                  }}
                />
              </View>
            }
            ItemSeprator={() => <View style={{height: 6}} />}
            render={(item, index) => {
              return (
                <LiquidityItem 
                  key={index.toString()}
                  lpItem={item} 
                  onPress={() => {
                    setLPItemForDetail(item)
                    setShowLPDetailModal(true)
                  }} 
                />
              )
            }}
          />
        </View>
      </View>
    </View>
  )
};