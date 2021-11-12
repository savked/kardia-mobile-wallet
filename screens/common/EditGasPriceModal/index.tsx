import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native'
import { useRecoilValue } from 'recoil'
import { languageAtom } from '../../../atoms/language'
import Button from '../../../components/Button'
import Divider from '../../../components/Divider'
import CustomModal from '../../../components/Modal'
import CustomTextInput from '../../../components/TextInput'
import { useKeyboardHook } from '../../../hooks/isKeyboardShown'
import { ThemeContext } from '../../../ThemeContext'
import { getLanguageString } from '../../../utils/lang'
import { formatNumberString, getDigit, isNumber } from '../../../utils/number'

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
    formatNumberString(initGasPrice)
  )
  const [error, setError] = useState('')

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
  };

	useKeyboardHook(_keyboardDidShow, _keyboardDidHide)

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
    setError('')
    const digitOnly = getDigit(gasPrice)
    console.log('digitOnly', digitOnly)
    if (!digitOnly) {
      isValid = false
      setError(getLanguageString(language, 'REQUIRED_FIELD'))
    }

    if (new BigNumber(digitOnly).isEqualTo(0)) {
      isValid = false
      setError(getLanguageString(language, 'ERROR_GAS_PRICE_EQUAL_0'))
    }

    if (!isValid) return
    onSuccess(digitOnly)
  }

  const handleCancel = () => {
    setGasPrice(formatNumberString(initGasPrice))
    setError('')
    onClose()
  }

  return (
    <CustomModal
      visible={visible}
      onClose={handleCancel}
      showCloseButton={false}
      contentStyle={getContentStyle()}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{width: '100%'}}>
          <CustomTextInput
            message={error}
            value={gasPrice}
            onChangeText={(newAmount) => {
              const digitOnly = getDigit(newAmount, false);
              if (digitOnly === '') {
                setGasPrice('0');
                return;
              }
              if (isNumber(digitOnly)) {
                let formatedValue = formatNumberString(digitOnly);

                setGasPrice(formatedValue);
              }
            }}
            headline={getLanguageString(language, 'GAS_PRICE')}
            headlineStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
            inputStyle={{
              backgroundColor: 'rgba(96, 99, 108, 1)',
              color: theme.textColor,
              marginBottom: 12
            }}
          />
          <Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
          <Button
            title={getLanguageString(language, 'CANCEL')}
            onPress={handleCancel}
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