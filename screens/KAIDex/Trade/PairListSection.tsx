import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import List from '../../../components/List';
import CustomText from '../../../components/Text';
import { getPairs } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { pairMapper } from '../../../utils/dex';
import PairListItem from './PairListItem';

export default ({showSearching}: {
  showSearching: () => void
}) => {
  const theme = useContext(ThemeContext)

  const [pairs, setPairs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [inited, setInited] = useState(false)

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const fetchPairData = async () => {
    try {
      setLoading(true)
      const rs = await getPairs()
      if (rs) {
        const parsedPairs = pairMapper(rs.pairs)
        setPairs(parsedPairs)
      }
      setLoading(false)
      setInited(true)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setInited(true)
    }
  }

  useEffect(() => {
    fetchPairData()
  }, [])

  const renderPairs = () => {
    if (loading && !inited) {
      return <ActivityIndicator color={theme.textColor} />
    }
    if (pairs) {
      // const list = pairData.pairs
      return (
        <View
          style={{flex: 1}}
        >
          <List
            items={pairs}
            refreshing={loading}
            onRefresh={fetchPairData}
            keyExtractor={(item: Pair) => item.contract_address}
            render={(item: Pair) => {
              return <PairListItem item={item} />
            }}
          />
        </View>
      );
    }
  }

  return (
    <View style={{flex: 1, paddingHorizontal: 20}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 8
        }}
      >
        <CustomText
          style={{
            color: theme.textColor,
            fontWeight: 'bold',
            fontSize: theme.defaultFontSize + 6,
            marginBottom: 8
          }}
        >
          Pairs
        </CustomText>
        <TouchableOpacity onPress={showSearching}>
          <AntIcon
            style={{padding: 0}}
            name="search1"
            color={theme.textColor}
            size={18}
          />
        </TouchableOpacity>
      </View>
      {renderPairs()}
    </View>
  )
}