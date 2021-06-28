import React, { useCallback, useContext } from 'react';
import Icon from 'react-native-vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../../ThemeContext';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import { useFocusEffect } from '@react-navigation/native';
import CustomText from '../../../components/Text';
import { getLanguageString } from '../../../utils/lang';
import { languageAtom } from '../../../atoms/language';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import List from '../../../components/List';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import { formatDexToken } from '../../../services/dex';

export default ({goBack, onSelect, pairData, loading}: {
  goBack: () => void;
  onSelect: (from: PairToken, to: PairToken, liquidityFrom: string, liquidityTo: string, pairAddress: string, volumeUSD: string) => void;
  pairData: any;
  loading: boolean;
}) => {
  const theme = useContext(ThemeContext);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  const language = useRecoilValue(languageAtom)

  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);

  // const { loading, error, data: pairData } = useQuery(GET_PAIRS);

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
        <View
          style={{flex: 1}}
        >
          <List
            items={list}
            keyExtractor={(item: Pair) => item.contract_address}
            render={(item: Pair) => {
              return (
                <TouchableOpacity 
                  key={item.contract_address} 
                  style={{
                    backgroundColor: theme.backgroundFocusColor,
                    padding: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    marginBottom: 12,
                  }}
                  onPress={() => {
                    onSelect(
                      formatDexToken(item.t1, wallets[selectedWallet]),
                      formatDexToken(item.t2, wallets[selectedWallet]),
                      item.token1_liquidity,
                      item.token2_liquidity,
                      item.contract_address,
                      item.volumeUSD
                    )
                  }}
                >
                  <View style={{flexDirection: 'row', marginRight: 12}}>
                    <View style={{width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16}}>
                      <Image
                        source={{uri: item.t1.logo}}
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
                        source={{uri: item.t2.logo}}
                        style={{width: 32, height: 32}}
                      />
                    </View>
                  </View>
                  <View style={{flex: 1, justifyContent: 'center'}}>
                    <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 4}}>
                      {formatDexToken(item.t1, wallets[selectedWallet]).symbol} / {formatDexToken(item.t2, wallets[selectedWallet]).symbol}
                    </CustomText>
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
    <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
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