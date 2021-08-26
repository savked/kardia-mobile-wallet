import React, { useCallback, useContext, useState } from 'react';
import { View } from 'react-native';
import { useSetRecoilState } from 'recoil';
import { ThemeContext } from '../../../ThemeContext';
import DEXHeader from '../../common/DEXHeader';
import { useFocusEffect } from '@react-navigation/native';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import MarketList from './MarketList';
import Tags from '../../../components/Tags';
import LimitList from './LimitList';
import PendingLimitList from './PendingLimitList'

export default () => {
	const theme = useContext(ThemeContext)
	
  const setTabBarVisible = useSetRecoilState(showTabBarAtom)

  const [tag, setTag] = useState('MARKET')

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={{
      backgroundColor: theme.backgroundColor, 
      flex: 1,
    }}>
      <DEXHeader
        type="ORDER_HISTORY"
      />
      <View style={{flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8}}>
        <Tags
          content="Market"
          active={tag === 'MARKET'}
          onPress={() => setTag('MARKET')}
          containerStyle={{
            marginRight: 8,
            width: undefined,
            minWidth: 60
          }}
        />
        <Tags
          content="Limit"
          active={tag === 'LIMIT'}
          onPress={() => setTag('LIMIT')}
          containerStyle={{
            marginRight: 8,
            width: undefined,
            minWidth: 60
          }}
        />
        <Tags
          content="Pending limit"
          active={tag === 'PENDING_LIMIT'}
          onPress={() => setTag('PENDING_LIMIT')}
          containerStyle={{
            width: undefined,
            minWidth: 60
          }}
        />
      </View>
      <View style={{flex: 1, paddingHorizontal: 20}}>
        {
          tag === 'MARKET' && <MarketList />
        }
        {
          tag === 'LIMIT' && <LimitList />
        }
        {
          tag === 'PENDING_LIMIT' && <PendingLimitList />
        }
      </View>
    </View>
	)
};