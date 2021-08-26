import { useNavigation } from '@react-navigation/core';
import React, { useContext } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';

export default ({type}: {
  type : 'TRADE' | 'LIQUIDITY' | 'ORDER_HISTORY' | 'LIMIT_ORDERS'
}) => {
  const navigation = useNavigation()
  const language = useRecoilValue(languageAtom)
  const theme = useContext(ThemeContext)

  const insets = useSafeAreaInsets();

  return (
    <View style={{
      width: '100%', 
      alignItems: 'center', 
      backgroundColor: theme.backgroundStrongColor,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 12,
      paddingTop: Platform.OS === 'android' ? 8 : insets.top
    }}>
      <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,}}>
        <CustomText
          style={{
            textAlign: 'left',
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 24
          }}
        >
          KaiDex
        </CustomText>
      </View>
      <View style={{borderRadius: 12, borderColor: 'rgba(96, 99, 108, 1)', borderWidth: 1.5, padding: 4, flexDirection: 'row', marginBottom: 24, width: '100%'}}>
        <TouchableOpacity 
          style={{flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'TRADE' ? theme.backgroundFocusColor : 'transparent'}}
          onPress={() => navigation.navigate('Trade')}
        >
          <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'TRADE' ? '500' : undefined, fontFamily: type === 'TRADE' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
            {getLanguageString(language, 'TRADE')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'LIQUIDITY' ? theme.backgroundFocusColor : 'transparent'}}
          onPress={() => navigation.navigate('AddLiquidity')}
        >
          <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'LIQUIDITY' ? '500' : undefined, fontFamily: type === 'LIQUIDITY' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
            {getLanguageString(language, 'ADD_LIQUIDITY')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'ORDER_HISTORY' ? theme.backgroundFocusColor : 'transparent'}}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'ORDER_HISTORY' ? '500' : undefined, fontFamily: type === 'ORDER_HISTORY' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
            {getLanguageString(language, 'ORDER_HISTORY')}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  )
}
