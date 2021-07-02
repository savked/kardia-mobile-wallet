import { useQuery } from '@apollo/client';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View, Image, Platform } from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useRecoilValue } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import List from '../../../components/List';
import CustomText from '../../../components/Text';
import { getMyPortfolio } from '../../../services/dex';
import { GET_PAIRS } from '../../../services/dex/queries';
import { ThemeContext } from '../../../ThemeContext';
import { pairMapper } from '../../../utils/dex';
import ComingSoon from '../../common/ComingSoon';
import LiquidityItem from './LiquidityItem';

export default () => {
  const theme = useContext(ThemeContext)
  const [lpList, setLPList] = useState<any[]>([])

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  const { loading, error, data: _pairData, refetch } = useQuery(GET_PAIRS, {fetchPolicy: 'no-cache'});

  useEffect(() => {
    (async () => {
      if (_pairData && _pairData.pairs && _pairData.pairs.length > 0) {
        const rs = await getMyPortfolio(pairMapper(_pairData.pairs), wallets[selectedWallet].address)
        console.log(rs)
        setLPList(rs)
      }
    })()
  }, [wallets, selectedWallet, _pairData])

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ComingSoon />
      {/* <List
        items={lpList}
        loading={loading}
        loadingColor={theme.textColor}
        keyExtractor={(_) => Date.now().toString()}
        ListEmptyComponent={
          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
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
              onPress={() => {}}
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
      /> */}
    </View>
  )
};