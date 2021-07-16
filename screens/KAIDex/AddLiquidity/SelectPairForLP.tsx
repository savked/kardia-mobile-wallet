import React, { useCallback, useContext, useState } from 'react';
import Icon from 'react-native-vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../../ThemeContext';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { showTabBarAtom } from '../../../atoms/showTabBar';
import { useFocusEffect } from '@react-navigation/native';
import CustomText from '../../../components/Text';
import { getLanguageString } from '../../../utils/lang';
import { languageAtom } from '../../../atoms/language';
import { ActivityIndicator, Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import List from '../../../components/List';
import { formatDexToken } from '../../../services/dex';
import CustomTextInput from '../../../components/TextInput';

export default ({goBack, onSelect, pairData, loading}: {
  goBack: () => void;
  onSelect: (pair: Pair) => void;
  pairData: Pair[];
  loading: boolean;
}) => {
  const theme = useContext(ThemeContext);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  const language = useRecoilValue(languageAtom)

  const [keyword, setKeyword] = useState('')

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const filterItem = () => {
    const list = pairData

    if (!keyword || keyword.trim() === '') return list

    return list.filter((item: any) => {
      const pairName = `${formatDexToken(item.t1).symbol} / ${formatDexToken(item.t2).symbol}`
      if (pairName.trim().toLowerCase().includes(keyword.trim().toLowerCase())) return true
      return false
    })

  }

  const renderPairs = () => {
    if (loading) {
      return <ActivityIndicator color={theme.textColor} />
    }
    if (pairData) {
      return (
        <View
          style={{flex: 1}}
        >
          <CustomTextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder={getLanguageString(language, 'SEARCH_PAIR_PLACEHOLDER')}
            placeholderTextColor={theme.mutedTextColor}
            containerStyle={{
              marginBottom: 18
            }}
            inputStyle={{
              backgroundColor: 'rgba(96, 99, 108, 1)',
              color: theme.textColor,
            }}
          />
          <List
            items={filterItem()}
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
                  onPress={() => onSelect(item)}
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
                      {formatDexToken(item.t1).symbol} / {formatDexToken(item.t2).symbol}
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
    <TouchableWithoutFeedback style={{flex: 1}} onPress={() => Keyboard.dismiss()}>
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
    </TouchableWithoutFeedback>
  );
}