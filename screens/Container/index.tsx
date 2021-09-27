/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Image, AppState, Dimensions, Linking, Platform} from 'react-native';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import Orientation from 'react-native-orientation-locker';
// import TransactionStackScreen from '../../TransactionStack';
import {
  getAddressBook,
  getAppPasscodeSetting,
  getCache,
  getFavPair,
  getFontSize,
  getLanguageSetting,
  getPendingTx,
  getRefCode,
  getSelectedWallet,
  getTokenList,
  getWallets,
  saveAllCache,
  saveSelectedWallet,
  saveTokenList,
  setFavPair,
} from '../../utils/local';
import {styles} from './style';
import NoWalletStackScreen from '../../NoWalletStack';
import {ThemeContext} from '../../ThemeContext';
import {getBalance} from '../../services/account';
import {tokenInfoAtom} from '../../atoms/token';
import {getKRC20TokensPrices, getTokenInfo} from '../../services/token';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import {localAuthAtom, localAuthEnabledAtom} from '../../atoms/localAuth';
import ConfirmPasscode from '../ConfirmPasscode';
import StakingStackScreen from '../../StakingStack';
import {getLanguageString} from '../../utils/lang';
import Portal from '@burstware/react-native-portal';
import {krc20ListAtom, krc20PricesAtom} from '../../atoms/krc20';
import HomeStackScreen from '../../HomeStack';
import CustomText from '../../components/Text';
import { fontSizeAtom } from '../../atoms/fontSize';
import { checkBlockchainStatus, getAppStatus } from '../../services/util';
import { INFO_DATA } from '../Setting';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { dexStatusAtom } from '../../atoms/dexStatus';
import { initDexConfig } from '../../services/dex';
import { cacheAtom } from '../../atoms/cache';
import SettingStackScreen from '../../SettingStack';
import DEXStackScreen from '../../DEXStack';
import { referralCodeAtom } from '../../atoms/referralCode';
import DAppStackScreen from '../../DAppStack';
import DualNodeStack from '../../DualNodeStack';
import { favoritePairsAtom } from '../../atoms/favoritePairs';
import { pendingTxAtom, pendingTxBackgroundAtom, pendingTxSelector } from '../../atoms/pendingTx';
import { getTxDetail } from '../../services/transaction';
import Toast from 'react-native-toast-message';
import { truncate } from '../../utils/string';
import IgnorePendingTxModal from '../common/IgnorePendingTxModal';
import CustomTab from './CustomTab';

const Tab = createBottomTabNavigator();

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window')

let lastTimestamp = 0;

const config = {
  screens: {
    Home: {
      screens: {
        AuthorizeAccess: 'authorize/:appName/:callbackSchema/:callbackPath',
        SignTxFromExternal: 'signTx/:signature/:txMeta'
      }
    }
  },
};

const linking = {
  prefixes: ['kardiachainwallet://'],
  config,
};

const Wrap = () => {
  const theme = useContext(ThemeContext);

  return (
    <Tab.Navigator
      tabBar={({state, descriptors, navigation}) => <CustomTab state={state} descriptors={descriptors} navigation={navigation} theme={theme} />}
      tabBarOptions={{
        activeTintColor: theme.primaryColor,
        inactiveTintColor: '#7A859A',
        inactiveBackgroundColor: theme.backgroundColor,
        activeBackgroundColor: theme.backgroundColor,
        keyboardHidesTabBar: true,
        tabStyle: {
          backgroundColor: theme.backgroundFocusColor,
          borderTopColor: theme.backgroundFocusColor,
          paddingBottom: 4,
          elevation: 24,
          width: 4
        },
        labelStyle: {
          fontWeight: 'bold',
          marginBottom: 4,
        },
        style: {
          backgroundColor: theme.backgroundFocusColor,
          borderTopColor: theme.backgroundFocusColor,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 2,
          shadowRadius: 4,
        },
      }}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="DApp" component={DAppStackScreen} />
      <Tab.Screen name="DEX" component={DEXStackScreen} />
      <Tab.Screen name="Staking" component={StakingStackScreen} />
      <Tab.Screen name="DualNode" component={DualNodeStack} />
      <Tab.Screen name="Setting" component={SettingStackScreen} />
    </Tab.Navigator>
  );
};

const AppContainer = () => {
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const setTokenInfo = useSetRecoilState(tokenInfoAtom);
  const setAddressBook = useSetRecoilState(addressBookAtom);
  const setKRC20TokenList = useSetRecoilState(krc20ListAtom);
  const setKRC20Prices = useSetRecoilState(krc20PricesAtom);
  const setFontSize = useSetRecoilState(fontSizeAtom);
  const setRefCode = useSetRecoilState(referralCodeAtom)
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );
  const [language, setLanguage] = useRecoilState(languageAtom);
  const [isLocalAuthed, setIsLocalAuthed] = useRecoilState(localAuthAtom);
  const [localAuthEnabled, setLocalAuthEnabled] = useRecoilState(
    localAuthEnabledAtom,
  );
  const [inited, setInited] = useState(0);
  const [appStatus, setAppStatus] = useState('OK')
  const [favoritePair, setFavoritePair] = useRecoilState(favoritePairsAtom)

  const setDexStatus = useSetRecoilState(dexStatusAtom)
  const [cache, setCache] = useRecoilState(cacheAtom)
  const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallets[selectedWallet] ? wallets[selectedWallet].address : ''))
  const setPendingTxFull = useSetRecoilState(pendingTxAtom)
  const [pendingTxBackground, setPendingTxBackground] = useRecoilState(pendingTxBackgroundAtom)
  const [showPendingTxModal, setShowPendingTxModal] = useState(false);

  const theme = useContext(ThemeContext);

  useEffect(() => {
    if (!inited || appStatus !== 'OK') return;
    saveAllCache(cache)
  }, [cache])

  useEffect(() => {
    (async () => {
      if (!inited || appStatus !== 'OK') return;
      let _selectedWallet = await getSelectedWallet();
      if (_selectedWallet !== selectedWallet) {
        await saveSelectedWallet(selectedWallet);
      }
    })();
  }, [selectedWallet, inited]);

  useEffect(() => {
    if (!inited || appStatus !== 'OK') return;
    setFavPair(favoritePair)
  }, [favoritePair])

  useEffect(() => {
    if (!pendingTx || !wallets[selectedWallet] || !pendingTxBackground || !inited) {
      Toast.hide();
      return
    }
    Toast.show({
      autoHide: false,
      type: 'pendingTx',
      props: {
        backgroundColor: theme.backgroundFocusColor,
        textColor: theme.textColor,
        onIgnore: () => {
          setShowPendingTxModal(true)
        }
      },
      topOffset: 45,
      text1: `Transaction preparing`,
      text2: truncate(pendingTx as string, 10, -1)
    })
    const pendingTxInterval = setInterval(async () => {
      console.log('start background check', pendingTx)
      try {
        const txDetail = await getTxDetail(pendingTx as string)

        if (txDetail.hash) {
          console.log('Found tx, clear background')
          setPendingTx('');
          setPendingTxBackground(false)
          clearInterval(pendingTxInterval);

          if (txDetail.status === 1) {
            // SUCCESS tx
            Toast.show({
              type: 'success',
              visibilityTime: 4000,
              autoHide: true,
              topOffset: 70,
              text1: getLanguageString(language, 'TX_SUCCESS_TOAST'),
              props: {
                textColor: '#000000'
              }
            });
          } else {
            // FAIL tx
            Toast.show({
              type: 'fail',
              visibilityTime: 4000,
              autoHide: true,
              topOffset: 70,
              text1: getLanguageString(language, 'TX_FAIL_TOAST'),
              props: {
                textColor: theme.textColor
              }
            });
          }
          return;
        }
      } catch (error) {
        console.log(error)
      }
    }, 5000);
    return () => clearInterval(pendingTxInterval); 

  }, [pendingTx, pendingTxBackground])

  useEffect(() => {
    if (!pendingTx) setPendingTxBackground(false)
  }, [pendingTx])

  const handleAppStateChange = useCallback(
    (state: string) => {
      if (state === 'background' || state === 'inactive') {
        // Store current time
        lastTimestamp = Date.now();
      } else if (state === 'active') {
        // Lock app if unfocused in 2 minute
        if (Date.now() - lastTimestamp > 2 * 60 * 1000) {
          setIsLocalAuthed(false);
        }
      }
    },
    [],
  );

  const compareVersion = (localVersion: string, serverVersion: string) => {
    const localArr = localVersion.split('.').map((i) => Number(i));
    const serverArr = serverVersion.split('.').map((i) => Number(i));
    if (serverArr[0] < localArr[0]) {
      return 'OK'
    }
    if (serverArr[0] > localArr[0]) {
      return 'NEED_UPDATE'
    }

    if (serverArr[1] < localArr[1]) {
      return 'OK'
    }
    if (serverArr[1] > localArr[1]) {
      return 'NEED_UPDATE'
    }

    if (serverArr[2] <= localArr[2]) {
      return 'OK'
    }
    return 'NEED_UPDATE'
  }

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inited]);

  useEffect(() => {
    (async () => {
      if (!wallets || !wallets[selectedWallet]) return
      const serverStatus = await getAppStatus(wallets[selectedWallet].address);
      try {
        // Init dex config
        await initDexConfig()
        setDexStatus(serverStatus.dexStatus)
      } catch (error) {
        setDexStatus('OFFLINE')
        console.error('Init Dex config fail');
        console.log(error)
      }
  
    })()
  }, [selectedWallet, wallets])

  useEffect(() => {
    (async () => {
      Orientation.lockToPortrait()
      const blockchainAvailable = await checkBlockchainStatus()
      if (!blockchainAvailable) {
        setInited(1)
        setAppStatus('UNDER_MAINTAINANCE')
        return;
      }

      const _wallets = await getWallets();
      const _selectedWallet = await getSelectedWallet();

      const address = _wallets && _wallets[_selectedWallet] ? _wallets[_selectedWallet].address : ''
      const serverStatus = await getAppStatus(address);
      if (serverStatus.status === 'UNDER_MAINTAINANCE') {
        setInited(1)
        setAppStatus('UNDER_MAINTAINANCE')
        return;
      }
      const compareResult = compareVersion(INFO_DATA.version, serverStatus.appVersion)
      setAppStatus(compareResult)
      if (compareResult !== 'OK') {
        setInited(1);
        return;
      }
      // Get local auth setting
      const enabled = await getAppPasscodeSetting();
      setLocalAuthEnabled(enabled);

      // Get local ref code
      const refCode = await getRefCode()
      setRefCode(refCode)

      // Get local ref code
      const favPair = await getFavPair()
      setFavoritePair(favPair)

      // Get local pending tx
      const pending = await getPendingTx();
      setPendingTxFull(pending)

      // Get local wallets data
      try {
        let localWallets = await getWallets();

        const promiseArr = localWallets.map(async (wallet: Wallet) => {
          try {
            wallet.balance = await getBalance(wallet.address);
          } catch (error) {
            wallet.balance = '0'
            console.log('Get balance fail')
          }
          return wallet;
        });

        localWallets = await Promise.all(promiseArr);
        setWallets(localWallets);
      } catch (error) {
        console.error(error);
      }

      // Get selected wallet
      try {
        let _selectedWallet = await getSelectedWallet();
        setSelectedWallet(_selectedWallet);
      } catch (error) {
        console.error(error);
      }

      // Get local cache
      try {
        const localCache = await getCache();
        setCache(localCache)
      } catch (error) {
        console.error(error);
      }

      // Get token info
      try {
        const info = await getTokenInfo();
        setTokenInfo(info);
      } catch (error) {
        console.error(error);
      }

      // Get KRC20 tokens price
      try {
        const krc20Price = await getKRC20TokensPrices();
        setKRC20Prices(krc20Price);
      } catch (error) {
        console.error(error);
      }

      // Get local address book
      const addressBook = await getAddressBook();
      setAddressBook(addressBook);

      // Get language setting
      const languageSetting = await getLanguageSetting();
      languageSetting && setLanguage(languageSetting);

      // Get local KRC20 list
      try {
        const krc20List = await getTokenList();
        const filteredList = krc20List.filter((item) => !!item.walletOwnerAddress)
        if (filteredList.length === krc20List.length) {
          console.log('No old token found')
        } else {
          console.log('Clear old token')
          await saveTokenList(filteredList);
        }
        setKRC20TokenList(filteredList); 
      } catch (error) {
        console.error(error);
      }

      // Get font size setting
      const fontSizeSetting = await getFontSize();
      setFontSize(fontSizeSetting)

      setInited(1);
    })();
  }, [
    setWallets,
    setTokenInfo,
    setAddressBook,
    setLanguage,
    setSelectedWallet,
    setKRC20TokenList,
    setLocalAuthEnabled,
  ]);

  if (!inited) {
    return (
      <View style={[styles.splashContainer, {backgroundColor: theme.backgroundColor}]}>
        <Image
          style={styles.splashLogo}
          source={require('../../assets/kardia-logo-full-white.png')}
        />
      </View>
    );
  }

  if (appStatus === 'UNDER_MAINTAINANCE') {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor, alignItems: 'center', justifyContent: 'center'}}>
        <Image
          source={require('../../assets/under_maintenance.png')}
          style={{
            width: viewportWidth,
            height: 400,
          }}
        />
        <CustomText style={{color: theme.textColor, fontSize: 32, textAlign: 'center', marginBottom: 12, fontWeight: 'bold'}}>Under maintenance</CustomText>
        <CustomText style={{color: theme.textColor, fontSize: 13, textAlign: 'center', marginHorizontal: 20}}>Sorry for the inconvenience .We will come back soon</CustomText>
      </SafeAreaView>
    )
  }

  if (appStatus === 'NEED_UPDATE') {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor, alignItems: 'center', justifyContent: 'center'}}>
        <CustomText style={{color: theme.textColor, fontSize: 28, fontWeight: 'bold', marginBottom: 12, marginHorizontal: 20}}>
          New version is available.
        </CustomText>
        <CustomText style={{color: theme.textColor, marginHorizontal: 20}}>
          A new version is available, please update your app to use latest features
        </CustomText>
        <Button
          title={'Update'}
          style={{marginHorizontal: 20, marginTop: 24}}
          onPress={() => {
            if (Platform.OS === 'android') {
              Linking.openURL("market://details?id=com.kardiawallet")
            } else {
              Linking.openURL("itms-apps://itunes.apple.com/us/app/apple-store/id1551620695")
            }
          }}
        />
      </SafeAreaView>
    )
  }

  if (wallets.length === 0) {
    return (
      <NavigationContainer>
        <Portal.Host>
          <NoWalletStackScreen />
        </Portal.Host>
      </NavigationContainer>
    );
  }

  return (
    <>
      <NavigationContainer
        linking={linking} 
        fallback={<CustomText style={{color: theme.textColor}}>Loading...</CustomText>}
      >
        <Portal.Host>
          <IgnorePendingTxModal
            visible={showPendingTxModal}
            onClose={() => setShowPendingTxModal(false)}
          />
          <Wrap />
          <View
            style={{
              position: 'absolute',
              top: !isLocalAuthed && localAuthEnabled ? 0 : viewportHeight + 40,
              left: 0, 
              width: viewportWidth,
              height: viewportHeight
            }}
          >
            <ConfirmPasscode />
          </View>
        </Portal.Host>
      </NavigationContainer>
    </>
  );
};

export default AppContainer;
