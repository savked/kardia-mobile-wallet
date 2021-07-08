import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native'
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
import EditGasPrice from '../EditGasPriceModal'
import EditGasLimitModal from '../EditGasLimitModal'

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
  const [edittingGas, setEdittingGas] = useState(false)
  const [gasPrice, setGasPrice] = useState(DEFAULT_GAS_PRICE_HEX)
  const [edittingGasPrice, setEdittingGasPrice] = useState(false)

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const wallets = useRecoilValue(walletsAtom)

  const getContentStyle = () => {
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 420,
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
      setLoading(false)
      setError(getLanguageString(language, 'GENERAL_ERROR'))
    }
  }

  useEffect(() => {
    (async () => {
      console.log('txObj', txObj)
      if (Object.keys(txObj).length === 0) return

      let estimatedGas: number = await estimateGas(txObj, txObj.data)
      if (!estimatedGas) {
        estimatedGas = DEFAULT_GAS_LIMIT
      } else {
        estimatedGas = Math.round(estimatedGas * 1.2)
      }
      setGas(`0x${estimatedGas.toString(16)}`)

      try {
        const gasPrice = await getRecomendedGasPrice()
        setGasPrice(`0x${gasPrice.toString(16)}`)
      } catch (error) {
        console.log('Get gas price error', error)
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
          <TouchableOpacity onPress={() => setEdittingGas(true)}>
            <CustomText style={{color: theme.urlColor}}>{formatNumberString((new BigNumber(gas, 16)).toFixed())}</CustomText>
          </TouchableOpacity>
        </View>
        <View style={styles.group}>
          <CustomText style={{color: theme.textColor}}>Gas Price:</CustomText>
          <TouchableOpacity onPress={() => setEdittingGasPrice(true)}>
            <CustomText style={{color: theme.urlColor}}>{formatNumberString((new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed())} OXY</CustomText>
          </TouchableOpacity>
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
          textStyle={{
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
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
          textStyle={{
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
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
        gasLimit={(new BigNumber(gas, 16)).toFixed()}
        gasPrice={(new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed()}
        amount="0"
      />
    );
  }

  if (edittingGasPrice) {
    return (
      <EditGasPrice
        visible={edittingGasPrice}
        initGasPrice={(new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed()}
        onClose={() => setEdittingGasPrice(false)}
        onSuccess={(newGasPrice: string) => {
          const bnVal = new BigNumber(newGasPrice)
          setGasPrice(`0x${bnVal.multipliedBy(new BigNumber(10 ** 9)).toString(16)}`)
          setEdittingGasPrice(false)
        }}
      />
    )
  }

  if (edittingGas) {
    console.log('initial gas', gas)
    return (
      <EditGasLimitModal
        visible={edittingGas}
        initGas={(new BigNumber(gas, 16)).toFixed()}
        onClose={() => setEdittingGas(false)}
        onSuccess={(newGas: string) => {
          const bnVal = new BigNumber(newGas)
          setGas(`0x${bnVal.toString(16)}`)
          setEdittingGas(false)
        }}
      />
    )
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