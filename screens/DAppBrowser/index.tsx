import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import loadLocalResource from 'react-native-local-resource'
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRecoilValue } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import CustomTextInput from '../../components/TextInput';
import { RPC_ENDPOINT } from '../../services/config';
import { ThemeContext } from '../../ThemeContext';
import { parseError, parseRun } from '../../utils/dapp';
import { parseURL } from '../../utils/string';
import ConfirmTxFromBrowserModal from '../common/ConfirmTxFromBrowserModal';
// @ts-ignore
const myResource = require('./kardia-web3-mobile-provider-min.jsstring');
import {styles} from './style'

export default () => {
  const theme = useContext(ThemeContext)
  const [resource, setResource] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [requestIdForCallback, setRequestIdForCallback] = useState(0)
  const [txObj, setTxObj] = useState<Record<string, any>>({})
  const [url, setURL] = useState('');
  const [submittedURL, setSubmittedURL] = useState('')
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
    // console.log('Log from frame', logData)
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
      <View style={{
        padding: 18
      }}>
        <CustomTextInput
          autoCompleteType="off"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={(e) => {
            if (!e.nativeEvent.text) return;
            const parsedURL = parseURL(e.nativeEvent.text)
            setURL(parsedURL)
            setSubmittedURL(parsedURL)
            // setLoadingURL(true)
          }}
          value={url}
          onChangeText={setURL}
          icons={() => {
            if (!loadingURL) return null
            return (
              <View style={{position: 'absolute', right: 10}}>
                <ActivityIndicator color="#000" />
              </View>
            )
          }}
        />
      </View>
      {
        submittedURL === '' ? 
        <View>

        </View>
        :
        <WebView
          ref={webRef}
          javaScriptEnabled={true}
          automaticallyAdjustContentInsets={false}
          injectedJavaScript={ resource }
          onMessage={onMessage}
          onLoadStart={() => setLoadingURL(true)}
          onLoadEnd={() => setLoadingURL(false)}
          // source={{ uri: 'https://becoswap.com' }}
          source={{ uri: submittedURL }}
          style={styles.webview}
          containerStyle={{
            flex: 1,
          }}
        /> 
      }
    </View>
  )  
}