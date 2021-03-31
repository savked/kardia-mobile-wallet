/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Image, AppState} from 'react-native';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import TransactionStackScreen from '../../TransactionStack';
import {
  getAddressBook,
  getAppPasscodeSetting,
  getLanguageSetting,
  getSelectedWallet,
  getTokenList,
  getWallets,
  saveSelectedWallet,
} from '../../utils/local';
import {styles} from './style';
import NoWalletStackScreen from '../../NoWalletStack';
import {createStackNavigator} from '@react-navigation/stack';
import Notification from '../Notification';
import {ThemeContext} from '../../ThemeContext';
import {getBalance} from '../../services/account';
import {tokenInfoAtom} from '../../atoms/token';
import {getTokenInfo} from '../../services/token';
import SettingStackScreen from '../../SettingStack';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import {localAuthAtom, localAuthEnabledAtom} from '../../atoms/localAuth';
import ConfirmPasscode from '../ConfirmPasscode';
import StakingStackScreen from '../../StakingStack';
import {getLanguageString} from '../../utils/lang';
import Portal from '@burstware/react-native-portal';
import {krc20ListAtom} from '../../atoms/krc20';
import HomeStackScreen from '../../HomeStack';
import AddressStackScreen from '../../AddressStack';
import {showTabBarAtom} from '../../atoms/showTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

let lastTimestamp = 0;

const Wrap = () => {
  const theme = useContext(ThemeContext);

  const showTabBar = useRecoilValue(showTabBarAtom);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size, focused}) => {
          let iconName = '';

          if (route.name === 'Home') {
            return (
              <Image
                style={{width: 24, height: 24}}
                source={
                  focused
                    ? require('../../assets/icon/home_dark.png')
                    : require('../../assets/icon/home_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'News') {
            iconName = 'newspaper-o';
          } else if (route.name === 'Transaction') {
            return (
              <Image
                style={{width: 24, height: 24}}
                source={
                  focused
                    ? require('../../assets/icon/transaction_dark.png')
                    : require('../../assets/icon/transaction_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'DApp') {
            iconName = 'th-large';
          } else if (route.name === 'Setting') {
            return (
              <Image
                style={{width: 24, height: 24}}
                source={
                  focused
                    ? require('../../assets/icon/setting_dark.png')
                    : require('../../assets/icon/setting_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'Staking') {
            return (
              <Image
                style={{width: 24, height: 24}}
                source={
                  focused
                    ? require('../../assets/icon/staking_dark.png')
                    : require('../../assets/icon/staking_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'Address') {
            return (
              <Image
                style={{width: 24, height: 24}}
                source={
                  focused
                    ? require('../../assets/icon/address_book_dark.png')
                    : require('../../assets/icon/address_book_dark_inactive.png')
                }
              />
            );
          }

          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarVisible: showTabBar,
      })}
      tabBarOptions={{
        activeTintColor: theme.primaryColor,
        inactiveTintColor: '#7A859A',
        inactiveBackgroundColor: theme.backgroundColor,
        activeBackgroundColor: theme.backgroundColor,
        keyboardHidesTabBar: true,
        tabStyle: {
          backgroundColor: theme.backgroundFocusColor,
          borderTopColor: theme.backgroundFocusColor,
        },
        labelStyle: {
          fontWeight: 'bold',
          marginBottom: 4,
        },
        style: {
          backgroundColor: theme.backgroundFocusColor,
          borderTopColor: theme.backgroundFocusColor,
        },

        // showLabel: false,
      }}>
      {/* <Tab.Screen name="Home" component={HomeScreen} /> */}
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Transaction" component={TransactionStackScreen} />
      {/* <Tab.Screen name="DApp" component={DAppScreen} /> */}
      <Tab.Screen name="Staking" component={StakingStackScreen} />
      <Tab.Screen name="Address" component={AddressStackScreen} />
      {/* <Tab.Screen name="News" component={NewsScreen} /> */}
      <Tab.Screen name="Setting" component={SettingStackScreen} />
    </Tab.Navigator>
  );
};

const AppContainer = () => {
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const setTokenInfo = useSetRecoilState(tokenInfoAtom);
  const setAddressBook = useSetRecoilState(addressBookAtom);
  const setKRC20TokenList = useSetRecoilState(krc20ListAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );
  const [language, setLanguage] = useRecoilState(languageAtom);
  const [isLocalAuthed, setIsLocalAuthed] = useRecoilState(localAuthAtom);
  const [localAuthEnabled, setLocalAuthEnabled] = useRecoilState(
    localAuthEnabledAtom,
  );
  const [inited, setInited] = useState(0);

  const theme = useContext(ThemeContext);

  useEffect(() => {
    (async () => {
      let _selectedWallet = await getSelectedWallet();
      if (_selectedWallet !== selectedWallet && inited) {
        await saveSelectedWallet(selectedWallet);
      }
    })();
  }, [selectedWallet, inited]);

  const handleAppStateChange = useCallback(
    (state: string) => {
      if (state === 'background') {
        // Store current time
        lastTimestamp = Date.now();
      } else if (state === 'active' && localAuthEnabled) {
        // Lock app if unfocused in 1 minute
        if (Date.now() - lastTimestamp > 1 * 60 * 1000) {
          setIsLocalAuthed(false);
        }
      }
    },
    [localAuthEnabled, setIsLocalAuthed],
  );

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inited]);

  useEffect(() => {
    (async () => {
      // Get local auth setting
      const enabled = await getAppPasscodeSetting();
      setLocalAuthEnabled(enabled);

      // Get local wallets data
      try {
        let localWallets = await getWallets();

        const promiseArr = localWallets.map(async (wallet) => {
          wallet.balance = await getBalance(wallet.address);
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

      // Get token info
      try {
        const info = await getTokenInfo();
        setTokenInfo(info);
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
      const krc20List = await getTokenList();
      setKRC20TokenList(krc20List);

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
      <View style={styles.splashContainer}>
        <Image
          style={styles.splashLogo}
          source={require('../../assets/kardia-logo-full-white.png')}
        />
      </View>
    );
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

  if (!isLocalAuthed && localAuthEnabled) {
    return <ConfirmPasscode />;
  }

  return (
    <>
      <NavigationContainer>
        <Portal.Host>
          <Stack.Navigator>
            <Stack.Screen
              options={{headerShown: false}}
              name="Wrap"
              component={Wrap}
            />
            <Stack.Screen
              name="Notification"
              component={Notification}
              options={{
                headerStyle: {
                  backgroundColor: theme.backgroundColor,
                },
                headerTitleStyle: {
                  color: theme.textColor,
                },
                headerTintColor: theme.textColor,
                headerTitle: getLanguageString(
                  language,
                  'NOTIFICATION_SCREEN_TITLE',
                ),
              }}
            />
          </Stack.Navigator>
        </Portal.Host>
      </NavigationContainer>
    </>
  );
};

export default AppContainer;
