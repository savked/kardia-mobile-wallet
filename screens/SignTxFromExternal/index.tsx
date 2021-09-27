import { useFocusEffect, useRoute } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { languageAtom } from '../../atoms/language'
import { showTabBarAtom } from '../../atoms/showTabBar'
import { statusBarColorAtom } from '../../atoms/statusBar'
import { walletsAtom } from '../../atoms/wallets'
import Button from '../../components/Button'
import CustomText from '../../components/Text'
import { DEFAULT_GAS_LIMIT, DEFAULT_GAS_PRICE } from '../../config'
import { sendRawTx } from '../../services/transaction'
import { ThemeContext } from '../../ThemeContext'
import { parseTxMetaForKardiaConnect } from '../../utils/kardiaConnect'
import { parseError } from '../../utils/lang'
import { formatNumberString } from '../../utils/number'
import { truncate } from '../../utils/string'
import { getSemiBoldStyle } from '../../utils/style'

export default () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const {params}: any = useRoute()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [value, setValue] = useState(new BigNumber(0))
  const [data, setData] = useState('')
  const [gas, setGas] = useState(new BigNumber(DEFAULT_GAS_LIMIT))
  const [gasPrice, setGasPrice] = useState(new BigNumber(DEFAULT_GAS_PRICE))

  const [callbackURL, setCallbackURL] = useState('')

  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const wallets = useRecoilValue(walletsAtom)

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!params || !params.signature || !params.txMeta || !params.callbackSchema || !params.callbackPath) return;
    const txParams = parseTxMetaForKardiaConnect(params.txMeta)
    console.log('lolo', txParams)

    // Set Tx params
    if (txParams.from) {
      setFrom(txParams.from)
    }
    if (txParams.to) {
      setTo(txParams.to)
    }
    if (txParams.gas) {
      setGas(new BigNumber(txParams.gas))
    }
    if (txParams.gasPrice) {
      setGasPrice(new BigNumber(txParams.gasPrice))
    }
    if (txParams.value) {
      setValue(new BigNumber(txParams.value))
    }
    if (txParams.data) {
      setData(txParams.data)
    }

    // Set callback url
    setCallbackURL(`${params.callbackSchema}://${params.callbackPath}`)

  }, [params])

  const handleReject = () => {
    const rejectURL = `${callbackURL}/reject`
    // TODO: call to reject URL
  }

  const handleApprove = async () => {
    const wallet = wallets.find((w) => w.address.toLowerCase() === from.toLowerCase())
    if (!wallet) return

    try {
      setLoading(true)
      const txObj: Record<string, any> = {
        from,
        to,
        gas,
        gasPrice
      }
      if (data) txObj.data = data
      const txHash = await sendRawTx(txObj, wallet)

      setLoading(false)
      console.log(txHash) 
    } catch (error) {
      console.log('error', error)
      setLoading(false)
      setError(parseError(error.message, language))
    }
  }

  if (from === '') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20
        }}
      >
        <ActivityIndicator color={theme.textColor} size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
      }}
    >
      <CustomText
        style={[{
          color: theme.textColor,
          fontSize: theme.defaultFontSize + 20
        }, getSemiBoldStyle()]}
      >
        Sign transaction
      </CustomText>
      <View style={{flexDirection: 'row', width: '100%', marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
        <CustomText
          style={{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 3
          }}
        >
          From:
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {truncate(from, 10, 10)}
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', width: '100%', marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
        <CustomText
          style={{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 3
          }}
        >
          To:
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {truncate(to, 10, 10)}
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', width: '100%', marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
        <CustomText
          style={{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 3
          }}
        >
          Amount:
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {formatNumberString(value.dividedBy(10 ** 18).toFixed())} KAI
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', width: '100%', marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
        <CustomText
          style={{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 3
          }}
        >
          Gas:
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {formatNumberString(gas.toFixed())}
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', width: '100%', marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
        <CustomText
          style={{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 3
          }}
        >
          Gas price:
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {formatNumberString(gasPrice.toFixed())} HYDRO
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', width: '100%', marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
        <CustomText
          style={{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 3
          }}
        >
          Data:
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {truncate(data, 10, 10)}
        </CustomText>
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 40, marginTop: 40}}>
        <Button 
          type="outline"
          title="Reject"
          block
          disabled={loading}
          onPress={handleReject}
          style={{marginBottom: 12}}
          textStyle={getSemiBoldStyle()}
        />
        <Button
          title="Approve"
          block
          loading={loading}
          textStyle={getSemiBoldStyle()}
          onPress={handleApprove}
        />
      </View>
    </SafeAreaView>
  )
}