import { useQuery } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, View, Image, Platform } from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import List from '../../../components/List';
import CustomText from '../../../components/Text';
import { getMyPortfolio } from '../../../services/dex';
import { GET_PAIRS } from '../../../services/dex/queries';
import { ThemeContext } from '../../../ThemeContext';
import { pairMapper } from '../../../utils/dex';
import AddLiquidityModal from '../../common/AddLiquidityModal';
import ComingSoon from '../../common/ComingSoon';
import LiquidityItem from './LiquidityItem';
import SelectPairForLP from './SelectPairForLP';

export default ({toggleMenu}: {
  toggleMenu: () => void
}) => {
  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  const theme = useContext(ThemeContext)
  const [lpList, setLPList] = useState<any[]>([])
  const [showNewLPModal, setShowNewLPModal] = useState(false)
  const [pairForNewLP, setPairForNewLP] = useState<Pair>()
  const [selectingPair, setSelectingPair] = useState(false)

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  const { loading, error, data: _pairData, refetch } = useQuery(GET_PAIRS, {fetchPolicy: 'no-cache'});

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      if (_pairData && _pairData.pairs && _pairData.pairs.length > 0) {
        const rs = await getMyPortfolio(pairMapper(_pairData.pairs), wallets[selectedWallet].address)
        setLPList(rs)
      }
    })()
  }, [wallets, selectedWallet, _pairData])

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
    <View
      style={{
        flex: 1,
      }}
    >
      {/* <ComingSoon /> */}
      <AddLiquidityModal
        visible={showNewLPModal}
        onClose={() => {
          setShowNewLPModal(false)
        }}
        pair={pairForNewLP}
      />
      <List
        items={lpList}
        loading={loading}
        loadingColor={theme.textColor}
        keyExtractor={(_) => Date.now().toString()}
        containerStyle={{
          flex: 1
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
        render={(item) => {
          return <LiquidityItem lpItem={item} />
        }}
      />
    </View>
  )
};