import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useState } from 'react';
import { Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import MarketScreen from './Trade/MarketScreen';
import { getLanguageString } from '../../utils/lang';
import { languageAtom } from '../../atoms/language';
import UnderMaintainence from '../common/UnderMaintainence';
import { dexStatusAtom } from '../../atoms/dexStatus';
import ComingSoon from '../common/ComingSoon';
import { statusBarColorAtom } from '../../atoms/statusBar';
import OrderHistory from './OrderHistory';
import AddLiquidity from './AddLiquidity';

export default () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const {params} = useRoute();

  const [type, setType] = useState('TRADE');
  const [showMenu, setShowMenu] = useState(true);
  
  const dexStatus = useRecoilValue(dexStatusAtom)

  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );


  if (dexStatus === 'OFFLINE') {
    return <UnderMaintainence />
  }

  if (dexStatus === 'COMING_SOON') {
    return <ComingSoon />
  }

  return (
    <View style={{backgroundColor: theme.backgroundColor, flex: 1, paddingHorizontal: 20, paddingTop: showMenu ? 28 + insets.top : 0}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{flex: 1}}>
          {
            showMenu && (
              <View style={{width: '100%', alignItems: 'center'}}>
                <View style={{borderRadius: 12, borderColor: 'rgba(96, 99, 108, 1)', borderWidth: 1.5, padding: 4, flexDirection: 'row', marginBottom: 24}}>
                  <TouchableOpacity 
                    style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'TRADE' ? theme.backgroundFocusColor : 'transparent'}}
                    onPress={() => setType('TRADE')}
                  >
                    <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'TRADE' ? '500' : undefined, fontFamily: type === 'TRADE' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
                      {getLanguageString(language, 'TRADE')}
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'LIQUIDITY' ? theme.backgroundFocusColor : 'transparent'}}
                    onPress={() => setType('LIQUIDITY')}
                  >
                    <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'LIQUIDITY' ? '500' : undefined, fontFamily: type === 'LIQUIDITY' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
                      {getLanguageString(language, 'ADD_LIQUIDITY')}
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'ORDER_HISTORY' ? theme.backgroundFocusColor : 'transparent'}}
                    onPress={() => setType('ORDER_HISTORY')}
                  >
                    <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'ORDER_HISTORY' ? '500' : undefined, fontFamily: type === 'ORDER_HISTORY' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
                      {getLanguageString(language, 'ORDER_HISTORY')}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }
          {type === 'TRADE' && 
            <MarketScreen 
              toggleMenu={() => {
                setShowMenu(!showMenu)
              }}
              params={params}
            />
          }
          {type === 'LIQUIDITY' && <AddLiquidity />}
          {type === 'ORDER_HISTORY' && <OrderHistory />}
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
};