import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../atoms/showTabBar';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import ExchangeScreen from './ExchangeScreen';
import SelectingPair from './SelectingPair';
import SwapScreen from './SwapScreen';

export default () => {
  const theme = useContext(ThemeContext);

  const [type, setType] = useState('SWAP');
  const [selectingPair, setSelectingPair] = useState(false)

  const [tokenFrom, setTokenFrom] = useState<PairToken>()
  const [tokenTo, setTokenTo] = useState<PairToken>()
  const setTabBarVisible = useSetRecoilState(showTabBarAtom)

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!selectingPair) {
      setTabBarVisible(true)
    }
  }, [selectingPair])

  if (selectingPair) {
    return (
      <SelectingPair
        goBack={() => setSelectingPair(false)}
        onSelect={(from: PairToken, to: PairToken) => {
          setTokenFrom(from);
          setTokenTo(to);
          setSelectingPair(false);
        }}
      />
    )
  }

  return (
    <SafeAreaView style={{backgroundColor: theme.backgroundColor, flex: 1, paddingHorizontal: 20}}>
      <View style={{width: '100%', alignItems: 'center'}}>
        <View style={{borderRadius: 12, borderColor: 'rgba(96, 99, 108, 1)', borderWidth: 1.5, padding: 4, flexDirection: 'row', marginBottom: 32}}>
          <TouchableOpacity 
            style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'SWAP' ? theme.backgroundFocusColor : 'transparent'}}
            onPress={() => setType('SWAP')}
          >
            <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'SWAP' ? 'bold' : undefined}}>Swap</CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'EX' ? theme.backgroundFocusColor : 'transparent'}}
            onPress={() => setType('EX')}
          >
            <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'EX' ? 'bold' : undefined}}>Exchange</CustomText>
          </TouchableOpacity>
        </View>
      </View>
      {type === 'SWAP' ? 
        <SwapScreen 
          triggerSelectPair={() => setSelectingPair(true)} 
          tokenFrom={tokenFrom}
          tokenTo={tokenTo}
        /> 
        : 
        <ExchangeScreen />}
    </SafeAreaView>
  )
};