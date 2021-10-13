import React, { useContext, useEffect, useState } from 'react'
import { Keyboard, Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { useRecoilValue } from 'recoil'
import { languageAtom } from '../../../atoms/language'
import CustomModal from '../../../components/Modal'
import CustomText from '../../../components/Text'
import { ThemeContext } from '../../../ThemeContext'
import { getLanguageString } from '../../../utils/lang'
import LimitTradeForm from '../LimitTradeForm'
import MarketTradeForm from '../MarketTradeForm'

export default ({visible, onClose, pairItem, onSuccess}: {
  visible: boolean;
  onClose: () => void;
  pairItem: Pair;
  onSuccess: 
    ({
      mode, 
      amountTo,
      amountFrom,
      txResult,
      isLimit
    }: {
      mode: string 
      amountTo: string
      amountFrom: string
      txResult: string | Record<string, any>
      isLimit?: boolean
    }) => void
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [mode, setMode] = useState('MARKET')
  
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false);
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardWillShow', _keyboardDidShow);
      Keyboard.addListener('keyboardWillHide', _keyboardDidHide);
    } else {
      Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    }

    // cleanup function
    return () => {
      if (Platform.OS === 'ios') {
        Keyboard.removeListener('keyboardWillShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardWillHide', _keyboardDidHide);
      } else {
        Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
      }
    };
  }, []);

  const getModalContentStyle = () => {
    if (Platform.OS === 'android') {
      return {
        backgroundColor: theme.backgroundFocusColor,
        height: mode === 'MARKET' ? 690 : 680,
        padding: 0,
        marginBottom: keyboardShown ? -150 : 0,
        marginTop: keyboardShown ? -150 : 0,
      };
    } else {
      return {
        backgroundColor: theme.backgroundFocusColor,
        height: mode === 'MARKET' ? 690 : 680,
        padding: 0,
        marginBottom: keyboardShown ? keyboardOffset - 150 : 0,
        marginTop: keyboardShown ? -keyboardOffset - 150 : 0,
      };
    }
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={getModalContentStyle()}
    >
      <View 
        style={{
          borderRadius: 12, 
          borderColor: 'rgba(96, 99, 108, 1)', 
          borderWidth: 1.5, 
          padding: 4, 
          flexDirection: 'row', 
          marginTop: 22, 
          marginBottom: 8,
          marginHorizontal: 80,
          backgroundColor: theme.backgroundStrongColor
        }}>
        <TouchableOpacity 
          style={{flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: mode === 'MARKET' ? theme.backgroundFocusColor : 'transparent'}}
          onPress={() => setMode('MARKET')}
        >
          <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: mode === 'MARKET' ? '500' : undefined, fontFamily: mode === 'MARKET' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
            {getLanguageString(language, 'MARKET_MODE')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: mode === 'LIMIT' ? theme.backgroundFocusColor : 'transparent'}}
          onPress={() => setMode('LIMIT')}
        >
          <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: mode === 'LIMIT' ? '500' : undefined, fontFamily: mode === 'LIMIT' && Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
            {getLanguageString(language, 'LIMIT_MODE')}
          </CustomText>
        </TouchableOpacity>
      </View>
      <ScrollView style={{flex: 1}}>
        {
          mode === 'MARKET' ? 
          <MarketTradeForm pairItem={pairItem} onSuccess={onSuccess} onClose={onClose} />
          :
          pairItem.supportLimit ? 
          <LimitTradeForm pairItem={pairItem} onSuccess={onSuccess} onClose={onClose} />
          : 
          <CustomText style={{color: theme.textColor, paddingVertical: 12}}>
            {getLanguageString(language, 'NO_LIMIT_SUPPORT')}
          </CustomText>
        }
      </ScrollView>
    </CustomModal>
  )
}