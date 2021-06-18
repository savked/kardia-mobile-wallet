import React, { useContext, useState } from 'react'
import { View } from 'react-native'
import { useRecoilValue } from 'recoil'
import BigNumber from 'bignumber.js'
import { languageAtom } from '../../../atoms/language'
import CustomModal from '../../../components/Modal'
import CustomText from '../../../components/Text'
import { ThemeContext } from '../../../ThemeContext'
import { getLanguageString } from '../../../utils/lang'
import { toChecksum, truncate } from '../../../utils/string'
import {styles} from './styles'
import { formatNumberString } from '../../../utils/number'
import Button from '../../../components/Button'
import AuthModal from '../AuthModal'
import { walletsAtom } from '../../../atoms/wallets'
import { sendRawTx } from '../../../services/transaction'

export default ({visible, onClose, txObj, onConfirm}: {
  visible: boolean;
  onClose: () => void;
  txObj: Record<string, any>;
  onConfirm: (txhash: string) => void;
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const wallets = useRecoilValue(walletsAtom)

  const getContentStyle = () => {
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 430,
      justifyContent: 'flex-start'
    }
  }

  const handleConfirm = async () => {
    const wallet = wallets.find((w) => w.address.toLowerCase() === txObj.from.toLowerCase())
    if (!wallet) return

    try {
      setLoading(true)

      const txHash = await sendRawTx(txObj, wallet)

      setLoading(false)
      onConfirm(txHash) 
    } catch (error) {
      console.log('error', error)
    }
  }

  if (showAuthModal) {
    return (
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleConfirm}
      />
    );
  }

  return (
    <CustomModal
      visible={visible}
      onClose={() => {
        if (loading) return
        onClose()
      }}
      showCloseButton={false}
      contentStyle={getContentStyle()}
    >
      <CustomText 
        style={{
          color: theme.textColor,
          marginBottom: 24,
          fontSize: theme.defaultFontSize + 8,
          fontWeight: 'bold'
        }}
      >
        {getLanguageString(language, 'CONFIRM_TRANSACTION')}
      </CustomText>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'FROM')}:</CustomText>
        <CustomText style={{color: theme.textColor}}>{truncate(toChecksum((txObj.from || '').toLowerCase()), 10, 10)}</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'TO')}:</CustomText>
        <CustomText style={{color: theme.textColor}}>{truncate(toChecksum((txObj.to || '').toLowerCase()), 10, 10)}</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>Gas:</CustomText>
        <CustomText style={{color: theme.textColor}}>{formatNumberString((new BigNumber(txObj.gas, 16)).toFixed())}</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>Gas Price:</CustomText>
        <CustomText style={{color: theme.textColor}}>{formatNumberString((new BigNumber(txObj.gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed())} OXY</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'CONFIRM_KAI_AMOUNT')}:</CustomText>
        <CustomText style={{color: theme.textColor}}>{formatNumberString((new BigNumber(txObj.value || '0x0', 16)).dividedBy(new BigNumber(10 ** 18)).toFixed())} KAI</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>Data:</CustomText>
        <CustomText style={{color: theme.textColor}}>{truncate(txObj.data, 10, 10)}</CustomText>
      </View>
      <Button
        title={getLanguageString(language, 'CANCEL')}
        type="outline"
        disabled={loading}
        onPress={onClose}
        style={{
          width: '100%',
          marginTop: 32
        }}
      />
      <Button
        title={getLanguageString(language, 'CONFIRM')}
        disabled={loading}
        loading={loading}
        onPress={() => setShowAuthModal(true)}
        style={{
          width: '100%',
          marginTop: 12
        }}
      />
    </CustomModal>
  )
}