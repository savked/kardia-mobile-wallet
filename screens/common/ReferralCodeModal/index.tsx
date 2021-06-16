import React, { useContext, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useRecoilState, useRecoilValue } from 'recoil'
import { languageAtom } from '../../../atoms/language'
import { referralCodeAtom } from '../../../atoms/referralCode'
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets'
import Button from '../../../components/Button'
import CustomModal from '../../../components/Modal'
import CustomText from '../../../components/Text'
import CustomTextInput from '../../../components/TextInput'
import useIsKeyboardShown from '../../../hooks/isKeyboardShown'
import { submitReferal } from '../../../services/dex'
import { ThemeContext } from '../../../ThemeContext'
import { getLanguageString } from '../../../utils/lang'
import { saveRefCode } from '../../../utils/local'
import { getFromClipboard } from '../../../utils/string'

export default ({visible, onClose}: {
  visible: boolean;
  onClose: () => void
}) => {
  const theme = useContext(ThemeContext)
  const keyboardShown = useIsKeyboardShown();
  const language = useRecoilValue(languageAtom)

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  const [currentCode, setCurrentCode] = useRecoilState(referralCodeAtom)

  const [referralCode, setReferralCode] = useState(currentCode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('');

  const getContentStyle = () => {
    if (Platform.OS === 'android') {
      return {
        backgroundColor: theme.backgroundFocusColor,
        height: 400,
        padding: 20,
        paddingTop: 32,
        marginTop: keyboardShown ? 20 : 0,
        marginBottom: keyboardShown ? -20 : 0,
        paddingBottom: 52,
        justifyContent: 'flex-start'
      }
    }
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 400,
      padding: 20,
      paddingTop: 32,
      paddingBottom: 52,
      marginTop: keyboardShown ? -330 : 0,
      marginBottom: keyboardShown ? 330 : 0,
      justifyContent: 'flex-start'
    }
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={getContentStyle()}
    >
      <CustomText
        style={{
          color: theme.textColor,
          fontWeight: 'bold',
          fontSize: theme.defaultFontSize + 12
        }}
      >
        {getLanguageString(language, 'REFERRAL_CODE_TITLE')}
      </CustomText>
      <CustomText
        style={{
          color: theme.mutedTextColor,
          fontWeight: '500',
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
          fontSize: theme.defaultFontSize + 3,
          marginTop: 4
        }}
      >
        {getLanguageString(language, 'REFERRAL_CODE_DESCRIPTION')}
      </CustomText>
      <View
        style={{width: '100%'}}
      >
        <CustomTextInput
          editable={currentCode === ''}
          value={referralCode}
          message={error}
          onChangeText={setReferralCode}
          containerStyle={{
            marginTop: 12,
          }}
          inputStyle={{
            backgroundColor: theme.inputBackgroundColor,
            color: theme.textColor
          }}
          placeholder={getLanguageString(language, 'REFERRAL_CODE_PLACEHOLDER')}
          placeholderTextColor={theme.mutedTextColor}
          icons={() => {
            if (currentCode !== '') {
              return null
            }
            return (
              <TouchableOpacity
                style={{position: 'absolute', right: 10}}
                onPress={async () => setReferralCode(await getFromClipboard())}
              >
                <CustomText
                  style={{
                    color: theme.urlColor,
                    fontWeight: '500',
                    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                  }}
                >
                  Paste
                </CustomText>
              </TouchableOpacity>
            )
          }}
        />
        <CustomText
          style={{marginTop: 8, color: theme.textColor, fontStyle: 'italic'}}
        >
          {getLanguageString(language, 'REFERRAL_CODE_NOTE')}
        </CustomText>
      </View>
      <Button
        title={getLanguageString(language, 'CANCEL')}
        disabled={loading}
        onPress={onClose}
        type="outline"
        style={{
          width: '100%',
          marginTop: 36
        }}
      />
      <Button
        title={getLanguageString(language, 'SUBMIT')}
        loading={loading}
        disabled={loading}
        onPress={async () => {
          if (currentCode !== '') {
            onClose()
            return;
          }
          setLoading(true)
          setError('')

          const rsArr = await Promise.all(wallets.map(async (wallet) => {
            return await submitReferal(referralCode, wallet)
          }))

          const rs = !rsArr.includes(false)
          setLoading(false)
          if (!rs) {
            setError(getLanguageString(language, 'GENERAL_ERROR'))
          } else {
            setCurrentCode(referralCode);
            await saveRefCode(referralCode)
            onClose()
          }
        }}
        style={{
          width: '100%',
          marginTop: 12
        }}
        textStyle={{
          fontWeight: '500',
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
        }}
      />
    </CustomModal>
  )
}