import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import loadLocalResource from 'react-native-local-resource'
import {SafeAreaView} from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRecoilValue } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import { RPC_ENDPOINT } from '../../services/config';
import { ThemeContext } from '../../ThemeContext';
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

  const webRef = useRef<any>()

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  const handleConfirmTx = (txHash: string) => {
    const codeToRun = parseRun(requestIdForCallback, txHash)
    if (webRef && webRef.current) {
      console.log('found ref', codeToRun)
      webRef.current.injectJavaScript(codeToRun);
    }
  }

  const handleRejectTx = () => {
    const codeToRun = parseError(requestIdForCallback, 'Transacion rejected')
    if (webRef && webRef.current) {
      webRef.current.injectJavaScript(codeToRun);
    }
  }

  const parseRun = (id: any, result: any) => {
    const parsedResult = typeof result === 'string' ? `'${result}'` : JSON.stringify(result)
    return `
      window.kardiachain.sendResponse(${id}, ${parsedResult})
    `
  }

  const parseError = (id: any, errMessage: any) => {
    return `
      window.kardiachain.sendError(${id}, '${errMessage}')
    `
  }

  const handleLog = (logData: any) => {
    console.log(logData)
  }

  const handleRPC = (requestId: number, method: string, params: Record<string, any>) => {
    if (!method) return
    console.log('Method in handleRPC', method)
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
        console.log('received params', params)
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
  }, [])

  if (loading) {
    return (
      <ActivityIndicator size="large" color={theme.textColor} />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
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
      <WebView
        ref={webRef}
        injectedJavaScript={ resource }
        onMessage={onMessage}
        source={{ uri: 'http://10.10.0.61:3000' }}
        // source={{ uri: 'https://becoswap.com' }}
        style={styles.webview}
        contentMode="desktop"
     />
    </SafeAreaView>
  )  
}