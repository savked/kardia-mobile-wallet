import { useRoute } from '@react-navigation/core';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import loadLocalResource from 'react-native-local-resource'
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import ENIcon from 'react-native-vector-icons/Entypo';
import { RPC_ENDPOINT } from '../../services/config';
import { ThemeContext } from '../../ThemeContext';
import { parseError, parseRun } from '../../utils/dapp';
import ConfirmTxFromBrowserModal from '../common/ConfirmTxFromBrowserModal';
// @ts-ignore
const myResource = require('./kardia-web3-mobile-provider-min.jsstring');
import {styles} from './style'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomText from '../../components/Text';
import { showTabBarAtom } from '../../atoms/showTabBar';

export default () => {
  const {params} = useRoute()
  const navigation = useNavigation()

  const appURL = params ? (params as any).appURL : ''

  const theme = useContext(ThemeContext)
  const [resource, setResource] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [requestIdForCallback, setRequestIdForCallback] = useState(0)
  const [txObj, setTxObj] = useState<Record<string, any>>({})
  const [loadingURL, setLoadingURL] = useState(false)

  const webRef = useRef<any>()
  const insets = useSafeAreaInsets();

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  const handleConfirmTx = (txHash: string) => {
    const codeToRun = parseRun(requestIdForCallback, txHash)
    if (webRef && webRef.current) {
      webRef.current.injectJavaScript(codeToRun);
    }
  }

  const handleRejectTx = () => {
    const codeToRun = parseError(requestIdForCallback, 'Transacion rejected')
    if (webRef && webRef.current) {
      webRef.current.injectJavaScript(codeToRun);
    }
  }

  const handleLog = (logData: any) => {
    console.log('Log from frame', logData)
  }

  const handleRPC = (requestId: number, method: string, params: Record<string, any>) => {
    if (!method) return
    switch (method) {
      case 'requestAccounts':
        const codeToRun = parseRun(requestId, [wallets[selectedWallet].address])
        if (webRef && webRef.current) {
          webRef.current.injectJavaScript(codeToRun);
        }
        break;
      case 'eth_sendTransaction':
      case 'signTransaction':
        setTxObj(params)
        setConfirmModalVisible(true);
        break;
      default:
        throw 'Invalid method name'
    }
  }

  const onMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data)
    if (data.type && ['debug', 'info', 'warn', 'error', 'log'].includes(data.type)) {
      handleLog(data)
    } else {
      const requestId = data.id
      const method = data.name
      const params = data.object
      let codeToRun = ''

      try {
        if (requestId) {
          setRequestIdForCallback(requestId)
        }
        handleRPC(requestId, method, params)
      } catch (error) {
        codeToRun = parseError(requestId, error)
        if (webRef && webRef.current) {
          webRef.current.injectJavaScript(codeToRun);
        }
      }
    }
  }

  useEffect(() => {
    setLoading(true)
    loadLocalResource(myResource)
      .then((myResourceContent: any) => {
        setResource(
          myResourceContent
            .replace('{{KARDIA_RPC_URL}}', RPC_ENDPOINT)
            .replace('{{WALLET_ADDRESS}}', wallets[selectedWallet].address)
        )
        setLoading(false)
      }
    )
  }, [wallets, selectedWallet])

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  if (loading) {
    return (
      <ActivityIndicator size="large" color={theme.textColor} />
    )
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor, paddingTop: insets.top}]}>
      <ConfirmTxFromBrowserModal
        visible={confirmModalVisible}
        onClose={() => {
          setConfirmModalVisible(false)
          handleRejectTx()
        }}
        onConfirm={(txHash: string) => {
          setConfirmModalVisible(false)
          handleConfirmTx(txHash)
        }}
        txObj={txObj}
      />
      <View style={{width: '100%', backgroundColor: theme.backgroundColor, flexDirection: 'row', alignItems: 'center'}}>
        <ENIcon.Button
          style={{paddingLeft: 20}}
          name="chevron-left"
          onPress={() => navigation.goBack()}
          backgroundColor="transparent"
        />
        <CustomText style={{color: theme.textColor}}>KardiaChain Wallet</CustomText>
      </View>
      {
        loadingURL &&
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" />
          </View>
      }
      <WebView
        ref={webRef}
        javaScriptEnabled={true}
        automaticallyAdjustContentInsets={false}
        injectedJavaScriptBeforeContentLoaded={ resource }
        onMessage={onMessage}
        onLoadStart={() => setLoadingURL(true)}
        onLoadEnd={() => setLoadingURL(false)}
        source={{ uri: appURL }}
        style={styles.webview}
        containerStyle={{
          flex: loadingURL ? 0 : 1,
        }}
      /> 
    </View>
  )  
}