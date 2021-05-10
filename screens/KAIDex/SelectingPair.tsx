import React, { useCallback, useContext } from 'react';
import Icon from 'react-native-vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../ThemeContext';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { useFocusEffect } from '@react-navigation/native';
import CustomText from '../../components/Text';
import { getLanguageString } from '../../utils/lang';
import { languageAtom } from '../../atoms/language';
import { useQuery } from '@apollo/client';
import { GET_PAIRS } from '../../services/dex/queries';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import List from '../../components/List';

export default ({goBack, onSelect}: {
  goBack: () => void;
  onSelect: (from: PairToken, to: PairToken, liquidityFrom: string, liquidityTo: string) => void;
}) => {
  const theme = useContext(ThemeContext);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  const language = useRecoilValue(languageAtom)

  const { loading, error, data: pairData } = useQuery(GET_PAIRS);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const renderPairs = () => {
    if (loading) {
      return <ActivityIndicator color={theme.textColor} />
    }
    if (pairData) {
      const list = pairData.pairs
      return (
        <View>
          <List
            items={list}
            keyExtractor={(item: Pair) => item.pair_name}
            render={(item: Pair) => {
              return (
                <TouchableOpacity 
                  key={item.pair_name} 
                  style={{
                    backgroundColor: theme.backgroundFocusColor,
                    padding: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    marginBottom: 12,
                  }}
                  onPress={() => {
                    onSelect(item.t1, item.t2, item.token1_liquidity, item.token2_liquidity)
                  }}
                >
                  <View style={{flexDirection: 'row', marginRight: 12}}>
                    <Image
                      source={{uri: item.t1.logo}}
                      style={{width: 32, height: 32}}
                    />
                    <Image
                      source={{uri: item.t2.logo}}
                      style={{width: 32, height: 32, marginLeft: -8}}
                    />
                  </View>
                  <View style={{flex: 1, justifyContent: 'center'}}>
                    <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 4}}>{item.t1.symbol} / {item.t2.symbol}</CustomText>
                  </View>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      );
    }
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor, paddingHorizontal: 20}}>
      <Icon.Button
        style={{paddingLeft: 0}}
        name="chevron-left"
        onPress={goBack}
        backgroundColor="transparent"
      />
      <CustomText
        style={{
          color: theme.textColor,
          // textAlign: 'center',
          fontSize: 36,
          marginBottom: 20,
        }}>
        {getLanguageString(language, 'PAIRS')}
      </CustomText>
      {renderPairs()}
    </SafeAreaView>
  );
}