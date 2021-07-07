import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native'
import { useRecoilValue } from 'recoil'
import { languageAtom } from '../../../atoms/language'
import Button from '../../../components/Button'
import Divider from '../../../components/Divider'
import CustomModal from '../../../components/Modal'
import CustomTextInput from '../../../components/TextInput'
import { ThemeContext } from '../../../ThemeContext'
import { getLanguageString } from '../../../utils/lang'
import { getDigit } from '../../../utils/number'

export default ({
  visible,
  onClose,
  onSuccess,
  initGasPrice
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newPrice: string) => void;
  initGasPrice: string;
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [gasPrice, setGasPrice] = useState(
    initGasPrice
  )
  const [error, setError] = useState('')

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
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
	}, [])

  const getContentStyle = () => {
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 320,
      padding: 20,
			paddingTop: 34,
      marginBottom: Platform.OS === 'android' ? 0 : keyboardOffset,
			marginTop: Platform.OS === 'android' ? 0 : -keyboardOffset
    }
  }

  const handleSubmit = () => {
    let isValid = true
    const digitOnly = getDigit(gasPrice)
    if (!digitOnly) {
      isValid = false
      setError(getLanguageString(language, 'REQUIRED_FIELD'))
    }

    if (!isValid) return
    onSuccess(digitOnly)
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={getContentStyle()}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{width: '100%'}}>
          <CustomTextInput
            value={gasPrice}
            onChangeText={setGasPrice}
            headline={getLanguageString(language, 'GAS_PRICE')}
            headlineStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
            inputStyle={{
              backgroundColor: 'rgba(96, 99, 108, 1)',
              color: theme.textColor,
              marginBottom: 24
            }}
          />
          <Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
          <Button
            title={getLanguageString(language, 'CANCEL')}
            onPress={onClose}
            type="outline"
            style={{
              width: '100%',
              marginBottom: 8
            }}
            textStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
          <Button
            title={getLanguageString(language, 'SUBMIT')}
            onPress={handleSubmit}
            style={{
              width: '100%'
            }}
            textStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </CustomModal>
  )
}