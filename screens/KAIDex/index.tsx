import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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

export default () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const [type, setType] = useState('MARKET');
  const [selectingPair, setSelectingPair] = useState(false)

  const [tokenFrom, setTokenFrom] = useState<PairToken>()
  const [tokenFromLiquidity, setTokenFromLiquidity] = useState('');
  const [tokenTo, setTokenTo] = useState<PairToken>()
  const [tokenToLiquidity, setTokenToLiquidity] = useState('');
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
        onSelect={(from: PairToken, to: PairToken, liquidityFrom, liquidityTo) => {
          setTokenFrom(from);
          setTokenTo(to);
          setSelectingPair(false);
          setTokenFromLiquidity(liquidityFrom);
          setTokenToLiquidity(liquidityTo)
        }}
      />
    )
  }

  return (
    <SafeAreaView style={{backgroundColor: theme.backgroundColor, flex: 1, paddingHorizontal: 20}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{flex: 1}}>
          <View style={{width: '100%', alignItems: 'center'}}>
            <View style={{borderRadius: 12, borderColor: 'rgba(96, 99, 108, 1)', borderWidth: 1.5, padding: 4, flexDirection: 'row', marginBottom: 32}}>
              <TouchableOpacity 
                style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'MARKET' ? theme.backgroundFocusColor : 'transparent'}}
                onPress={() => setType('MARKET')}
              >
                <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'MARKET' ? 'bold' : undefined}}>
                  {getLanguageString(language, 'MARKET_TITLE')}
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'LIMIT' ? theme.backgroundFocusColor : 'transparent'}}
                onPress={() => setType('LIMIT')}
              >
                <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'LIMIT' ? 'bold' : undefined}}>
                  {getLanguageString(language, 'LIMIT_TITLE')}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
          {type === 'MARKET' ? 
            <MarketScreen 
              triggerSelectPair={() => setSelectingPair(true)} 
              tokenFrom={tokenFrom}
              tokenTo={tokenTo}
              tokenFromLiquidity={tokenFromLiquidity}
              tokenToLiquidity={tokenToLiquidity}
            /> 
            : 
            <ExchangeScreen />}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
};