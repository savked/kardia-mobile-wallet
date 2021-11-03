import { useRoute } from '@react-navigation/core';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, TouchableOpacity, View } from 'react-native';
import loadLocalResource from 'react-native-local-resource';
import Orientation from 'react-native-orientation-locker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ENIcon from 'react-native-vector-icons/Entypo';
import { WebView } from 'react-native-webview';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import Web3 from 'web3';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import CustomText from '../../components/Text';
import { RPC_ENDPOINT } from '../../services/config';
import { ThemeContext } from '../../ThemeContext';
import { hardReload, parseError, parseRun } from '../../utils/dapp';
import { getSemiBoldStyle } from '../../utils/style';
import ConfirmTxFromBrowserModal from '../common/ConfirmTxFromBrowserModal';
import { styles } from './style';
// @ts-ignore
const myResource = require('./kardia-web3-mobile-provider-min.jsstring');

const SCALE_FOR_DESKTOP = `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=0.5, maximum-scale=0.5, user-scalable=1'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `

export default () => {
  const {params} = useRoute()
  const navigation = useNavigation()

  const appURL = params ? (params as any).appURL : ''
  const allowLandscape = params && (params as any).allowLandscape ? (params as any).allowLandscape : false

  const theme = useContext(ThemeContext)
  const [resource, setResource] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [requestIdForCallback, setRequestIdForCallback] = useState(0)
  const [txObj, setTxObj] = useState<Record<string, any>>({})
  const [loadingURL, setLoadingURL] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('MOBILE')
  const [reloadWebView, setReloadWebView] = useState(Date.now())
  const [shouldUseCache, setShouldUseCache] = useState(true)

  const [showSetting, setShowSetting] = useState(false)

  const webRef = useRef<any>()
  const insets = useSafeAreaInsets();

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  useEffect(() => {
    if (allowLandscape) {
      Orientation.unlockAllOrientations()
      return () => {
        Orientation.lockToPortrait()
      }
    }
  }, [])

  const handleClearCache = () => {
    const codeToRun = hardReload()
    if (webRef && webRef.current) {
      if (Platform.OS === 'android') {
        webRef.current.clearCache()
      }
      webRef.current.injectJavaScript(codeToRun);
    }
    setShowSetting(false)

    // setShouldUseCache(false)
    // setReloadWebView(-1)

    // setTimeout(() => {
    //   setReloadWebView(Date.now())
    //   setShouldUseCache(true)
    // }, 300)

  }

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
    if (logData.type === 'error') {
      console.log('Log from frame', logData.data)
    }
  }

  const handleRPC = async (requestId: number, method: string, params: Record<string, any>) => {
    if (!method) return
    switch (method) {
      case 'signPersonalMessage':
        const web3 = new Web3(RPC_ENDPOINT)
        const {signature} = web3.eth.accounts.sign(params.data, wallets[selectedWallet].privateKey!)
        const rs = parseRun(requestId, signature)
        if (webRef && webRef.current) {
          webRef.current.injectJavaScript(rs);
        }
        break;
      case 'requestAccounts':
        const codeToRun = parseRun(requestId, [wallets[selectedWallet].address])
        if (webRef && webRef.current) {
          webRef.current.injectJavaScript(codeToRun);
        }
        break;
      case 'eth_sendTransaction':
      case 'signTransaction':
        setTxObj(JSON.parse(JSON.stringify(params)))
        setConfirmModalVisible(true);
        break;
      default:
        throw `Invalid method name ${method}`
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

  useEffect(() => {
    setReloadWebView(Date.now())
  }, [viewMode])

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
      <View style={{width: '100%', backgroundColor: theme.backgroundColor, flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ENIcon.Button
            style={{paddingLeft: 20}}
            name="chevron-left"
            onPress={() => {
              webRef && webRef.current && webRef.current.goBack()
            }}
            backgroundColor="transparent"
          />
          <CustomText style={{color: theme.textColor}}>KardiaChain Wallet</CustomText>  
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <ENIcon.Button
            style={{padding: 0}}
            name={'dots-three-horizontal'}
            onPress={() => {
              setShowSetting(!showSetting)
            }}
            backgroundColor="transparent"
          />
          <ENIcon.Button
            style={{paddingRight: 0}}
            name="cross"
            onPress={() => navigation.goBack()}
            backgroundColor="transparent"
          />
        </View>
      </View>
      <View style={{flex: 1}}>
        {
          loadingURL &&
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" />
            </View>
        }
        {
          reloadWebView > 0 &&
            <WebView
              cacheEnabled={shouldUseCache}
              ref={webRef}
              userAgent={
                viewMode === 'DESKTOP' ?
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2564.109 Safari/537.36"
                : undefined
              }
              scalesPageToFit={true}
              javaScriptEnabled={true}
              automaticallyAdjustContentInsets={false}
              injectedJavaScriptBeforeContentLoaded={ resource }
              injectedJavaScript={ viewMode === 'DESKTOP' ? SCALE_FOR_DESKTOP : '' }
              onMessage={onMessage}
              onLoadStart={() => setLoadingURL(true)}
              onLoadEnd={() => setLoadingURL(false)}
              source={{ uri: appURL }}
              style={styles.webview}
              containerStyle={{
                flex: loadingURL || error !== '' ? 0 : 1,
              }}
              renderError={(errorName) => {
                if (!errorName) return <CustomText>{''}</CustomText>;
                setError(errorName)
                return (
                  <View style={{backgroundColor: '#FFFFFF', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <CustomText 
                      style={{
                        fontSize: 30,
                        marginBottom: 30,
                        fontWeight: '500',
                        fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                      }}
                    >
                      Error loading your DApp
                    </CustomText>
                    <CustomText>Error code: {errorName}</CustomText>
                  </View>
                )
              }}
            /> 
        }
        {
          showSetting && 
          <View
            style={{
              position: 'absolute',
              top: -8, 
              right: 20,
              borderRadius: 8,
              backgroundColor: theme.backgroundFocusColor
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                paddingHorizontal: 18,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={handleClearCache}
            >
              <Image 
                source={require('../../assets/icon/clear_cache.png')}
                style={{
                  width: 18,
                  height: 18,
                  marginRight: 4
                }}
              />
              <CustomText 
                style={[{
                  color: theme.textColor, 
                  fontSize: theme.defaultFontSize + 3
                }, getSemiBoldStyle()]}
              >
                Hard reload
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                paddingHorizontal: 18,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => {
                setReloadWebView(-1)
                setShowSetting(false)
                viewMode === 'MOBILE' ? setViewMode('DESKTOP') : setViewMode('MOBILE')
              }}
            >
              <Image 
                source={require('../../assets/icon/switch_view.png')}
                style={{
                  width: 18,
                  height: 18,
                  marginRight: 4
                }}
              />
              <CustomText 
                style={[{
                  color: theme.textColor, 
                  fontSize: theme.defaultFontSize + 3
                }, getSemiBoldStyle()]}
              >
                {viewMode === 'MOBILE' ? 'Desktop' : 'Mobile'}{' '}view
              </CustomText>
            </TouchableOpacity>
          </View>
        }
      </View>
    </View>
  )  
}