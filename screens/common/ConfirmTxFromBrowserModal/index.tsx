import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native'
import { useRecoilValue } from 'recoil'
import BigNumber from 'bignumber.js'
import { languageAtom } from '../../../atoms/language'
import CustomModal from '../../../components/Modal'
import CustomText from '../../../components/Text'
import { ThemeContext } from '../../../ThemeContext'
import { getLanguageString } from '../../../utils/lang'
import { toChecksum, truncate } from '../../../utils/string'
import {styles} from './styles'
import { formatNumberString, getDecimalCount, getDigit, isNumber } from '../../../utils/number'
import Button from '../../../components/Button'
import AuthModal from '../AuthModal'
import { walletsAtom } from '../../../atoms/wallets'
import { estimateGas, getRecomendedGasPrice, sendRawTx } from '../../../services/transaction'
import { DANGEROUS_TX_FEE_KAI, DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE_HEX } from '../../../config'
import CustomTextInput from '../../../components/TextInput'
import Divider from '../../../components/Divider'
import Tags from '../../../components/Tags'

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

  const calculateTxFee = () => {
    if (!gas || !gasPrice) return ''
    const _gas = (new BigNumber(gas, 16)).toFixed();
    const _gasPrice = (new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed()
    const gasCostInKAI = (new BigNumber(_gasPrice)).multipliedBy(new BigNumber(_gas)).dividedBy(new BigNumber(10 ** 9))
    return gasCostInKAI.toFixed()
  }

  const calculateTotalCost = () => {
    if (!gas || !gasPrice) return ''
    const gasCostInKAI = new BigNumber(calculateTxFee())
    const amount = (new BigNumber(getField('value'), 16)).dividedBy(new BigNumber(10 ** 18))
    return gasCostInKAI.plus(new BigNumber(amount)).toFixed()
  }

  const isDangerous = () => {
    return Number(calculateTxFee()) > DANGEROUS_TX_FEE_KAI
  }

  const getContentStyle = () => {
    const additional = Platform.OS === 'android' ? 30 : 0
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: (isDangerous() ? 720 : 690) + additional,
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
      if (Object.keys(txObj).length === 0) return

      if (txObj.gas) {
        setGas(txObj.gas)
      } else {
        let estimatedGas: number = await estimateGas(txObj, txObj.data)
        if (!estimatedGas) {
          estimatedGas = DEFAULT_GAS_LIMIT
        } else {
          estimatedGas = Math.round(estimatedGas * 1.2)
        }
        setGas(`0x${estimatedGas.toString(16)}`)
      }

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
          <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'CONFIRM_KAI_AMOUNT')}:</CustomText>
          <CustomText style={{color: theme.textColor}}>{formatNumberString((new BigNumber(getField('value'), 16)).dividedBy(new BigNumber(10 ** 18)).toFixed())} KAI</CustomText>
        </View>
        <View style={styles.group}>
          <CustomText style={{color: theme.textColor}}>Data:</CustomText>
          <CustomText style={{color: theme.textColor}}>{truncate(getField('data'), 10, 10)}</CustomText>
        </View>
        <View style={styles.group}>
          <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'TOTAL_COST')}:</CustomText>
          <CustomText style={{color: theme.textColor}}>{formatNumberString(calculateTotalCost())} KAI</CustomText>
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
        // gasLimit={(new BigNumber(gas, 16)).toFixed()}
        // gasPrice={(new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed()}
        // amount="0"
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
      <TouchableWithoutFeedback style={{width: '100%'}} onPress={() => Keyboard.dismiss()}>
        <View style={{width: '100%'}}>
          <CustomText 
            style={{
              color: theme.textColor,
              marginBottom: 24,
              fontSize: theme.defaultFontSize + 8,
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {getLanguageString(language, 'CONFIRM_TRANSACTION')}
          </CustomText>
          {
            !preparing && (
              <View
                style={{width: '100%', alignItems: 'flex-start'}}
              >
                <CustomText
                  style={{
                    fontWeight: '500',
                    marginBottom: 4,
                    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
                    color: theme.textColor
                  }}
                >
                  {getLanguageString(language, 'GAS_PRICE')}
                </CustomText>
                <View style={{justifyContent: 'center', marginBottom: 12}}>
                  <CustomTextInput
                    value={formatNumberString((new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed())}
                    onChangeText={(newAmount) => {
                      const digitOnly = getDigit(newAmount, false);
                      if (digitOnly === '') {
                        setGasPrice('0x00');
                        return;
                      }

                      if (getDecimalCount(newAmount) > 0) {
                        return;
                      }

                      if (isNumber(digitOnly)) {
                        const bnVal = new BigNumber(digitOnly)
                        setGasPrice(`0x${bnVal.multipliedBy(new BigNumber(10 ** 9)).toString(16)}`)
                      }
                    }}
                    inputStyle={{
                      backgroundColor: 'rgba(96, 99, 108, 1)',
                      color: theme.textColor,
                      paddingRight: 45
                    }}
                  />
                  <CustomText
                    style={{
                      position: 'absolute',
                      right: 10,
                      color: theme.textColor
                    }}
                  >
                    OXY
                  </CustomText>
                </View>
              </View>
            )
          }
          {
            !preparing && (
              <View style={{flexDirection: 'row', marginBottom: 12}}>
                <Tags content={`1 OXY`} active={(new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed() === '1'} containerStyle={{marginRight: 12}} onPress={() => setGasPrice('0x3B9ACA00')} />
                <Tags content={`3 OXY`} active={(new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed() === '3'} containerStyle={{marginRight: 12}} onPress={() => setGasPrice('0xB2D05E00')} />
                <Tags content={`5 OXY`} active={(new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed() === '5'} containerStyle={{marginRight: 12}} onPress={() => setGasPrice('0x12A05F200')} />
                <Tags content={`10 OXY`} active={(new BigNumber(gasPrice, 16)).dividedBy(new BigNumber(10 ** 9)).toFixed() === '10'} onPress={() => setGasPrice('0x2540BE400')} />
              </View>
            )
          }
          {
            !preparing && (
              <View
                style={{width: '100%', alignItems: 'flex-start'}}
              >
                <CustomTextInput
                  value={formatNumberString((new BigNumber(gas, 16)).toFixed())}
                  onChangeText={(newAmount) => {
                    const digitOnly = getDigit(newAmount);
                    if (digitOnly === '') {
                      setGas('0x00');
                      return;
                    }

                    if (getDecimalCount(newAmount) > 0) {
                      return;
                    }

                    if (isNumber(digitOnly)) {
                      // let formatedValue = formatNumberString(digitOnly);
                      const bnVal = new BigNumber(digitOnly)
                      setGas(`0x${bnVal.toString(16)}`)
                    }
                  }}
                  headline={getLanguageString(language, 'GAS_LIMIT')}
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
              </View>
            )
          }
          
          <CustomText style={{color: theme.textColor}}>
            {getLanguageString(language, 'TX_FEE')}
          </CustomText>
          <View style={{padding: 12, backgroundColor: theme.backgroundColor, borderRadius: 8, marginTop: 8, marginBottom: 12}}>
            <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 12}}>
              {formatNumberString(calculateTxFee())}{' '}
              <CustomText style={{fontWeight: '400', color: theme.mutedTextColor}}>
                KAI
              </CustomText>
            </CustomText>
          </View>
          {
            isDangerous() && (
              <CustomText
                style={{
                  fontWeight: 'bold',
                  width: '100%',
                  textAlign: 'center',
                  color: theme.warningTextColor,
                  // marginBottom: 12,
                }}
              >
                {getLanguageString(language, 'TX_FEE_WARNING')}
              </CustomText>
            )
          }
          <Divider style={{width: '100%', backgroundColor: '#F0F1F2'}} />
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
        </View>
      </TouchableWithoutFeedback>
    </CustomModal>
  )
}