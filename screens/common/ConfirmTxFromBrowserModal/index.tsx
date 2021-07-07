import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
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
import { estimateGas, getRecomendedGasPrice, sendRawTx } from '../../../services/transaction'
import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE_HEX } from '../../../config'
import {isNaN} from '../../../utils/number'

export default ({visible, onClose, txObj, onConfirm}: {
  visible: boolean;
  onClose: () => void;
  txObj: Record<string, any>;
  onConfirm: (txhash: string) => void;
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const [preparing, setPreparing] = useState(false)
  const [gas, setGas] = useState('0x0')
  const [gasPrice, setGasPrice] = useState(DEFAULT_GAS_PRICE_HEX)

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const wallets = useRecoilValue(walletsAtom)

  const getContentStyle = () => {
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 440,
      justifyContent: 'flex-start'
    }
  }

  const handleConfirm = async () => {
    const wallet = wallets.find((w) => w.address.toLowerCase() === getField('from').toLowerCase())
    if (!wallet) return

    try {
      setLoading(true)
      txObj.gas = gas
      txObj.gasPrice = gasPrice
      const txHash = await sendRawTx(txObj, wallet, true)

      setLoading(false)
      onConfirm(txHash) 
    } catch (error) {
      console.log('error', error)
      setLoading(false)
      setError(getLanguageString(language, 'GENERAL_ERROR'))
    }
  }

  useEffect(() => {
    (async () => {

      if (!txObj.gas) {
        let estimatedGas: number = await estimateGas(txObj, txObj.data)
        if (!estimatedGas) {
          estimatedGas = DEFAULT_GAS_LIMIT
        } else {
          estimatedGas = Math.round(estimatedGas * 1.2)
        }
        setGas(`0x${estimatedGas.toString(16)}`)
        // txObj.gas = `0x${estimatedGas.toString(16)}`
      } else {
        setGas(txObj.gas)
      }

      if (txObj.gasPrice && !isNaN(txObj.gasPrice)) {
        setGasPrice(txObj.gasPrice)
      } else {
        try {
          const gasPrice = await getRecomendedGasPrice()
          setGasPrice(`0x${gasPrice.toString(16)}`)
        } catch (error) {
          console.log('Get gas price error', error)
        }
      }
    })()
  }, [txObj])

  const getField = (field: string) => {
    if (!txObj) return ''
    if (txObj[field]) {
      return txObj[field]
    }
    return ''
  }

  const renderTx = () => {
    return (
      <>
        <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'FROM')}:</CustomText>
        <CustomText style={{color: theme.textColor}}>{truncate(toChecksum(getField('from').toLowerCase()), 10, 10)}</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'TO')}:</CustomText>
        <CustomText style={{color: theme.textColor}}>{truncate(toChecksum(getField('to').toLowerCase()), 10, 10)}</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>Gas:</CustomText>
        <CustomText style={{color: theme.textColor}}>{formatNumberString((new BigNumber(gas, 16)).toFixed())}</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>Gas Price:</CustomText>
        <CustomText style={{color: theme.textColor}}>{formatNumberString((new BigNumber(getField('gasPrice'), 16)).dividedBy(new BigNumber(10 ** 9)).toFixed())} OXY</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'CONFIRM_KAI_AMOUNT')}:</CustomText>
        <CustomText style={{color: theme.textColor}}>{formatNumberString((new BigNumber(getField('value'), 16)).dividedBy(new BigNumber(10 ** 18)).toFixed())} KAI</CustomText>
      </View>
      <View style={styles.group}>
        <CustomText style={{color: theme.textColor}}>Data:</CustomText>
        <CustomText style={{color: theme.textColor}}>{truncate(getField('data'), 10, 10)}</CustomText>
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
      </>
    )
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
      {
        preparing ? <ActivityIndicator color={theme.textColor} size="large" /> : 
        renderTx()
      }
      {
        error !== '' && 
        <CustomText
          style={{
            color: 'red',
            textAlign: 'left',
            width: '100%',
            marginTop: 8,
            fontStyle: 'italic'
          }}
        >
          {error}
        </CustomText>
      }
    </CustomModal>
  )
}