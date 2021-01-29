import React, {useContext, useEffect, useState} from 'react';
import {View, Image} from 'react-native';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import HomeScreen from '../Home';
// import NewsScreen from '../News';
import TransactionStackScreen from '../../TransactionStack';
import {
  getAddressBook,
  getAppPasscodeSetting,
  getLanguageSetting,
  getSelectedWallet,
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
import {localAuthAtom} from '../../atoms/localAuth';
import ConfirmPasscode from '../ConfirmPasscode';
// import DAppScreen from '../DApp';
import StakingStackScreen from '../../StakingStack';
import {getLanguageString} from '../../utils/lang';
import Portal from '@burstware/react-native-portal';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Wrap = () => {
  const theme = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'News') {
            iconName = 'newspaper-o';
          } else if (route.name === 'Transaction') {
            iconName = 'exchange';
          } else if (route.name === 'DApp') {
            iconName = 'th-large';
          } else if (route.name === 'Setting') {
            iconName = 'cog';
          } else if (route.name === 'Staking') {
            iconName = 'bank';
          }

          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: theme.primaryTextColor,
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
        },
        style: {
          backgroundColor: theme.backgroundFocusColor,
          borderTopColor: theme.backgroundFocusColor,
        },
        showLabel: false,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transaction" component={TransactionStackScreen} />
      {/* <Tab.Screen name="DApp" component={DAppScreen} /> */}
      <Tab.Screen name="Staking" component={StakingStackScreen} />
      {/* <Tab.Screen name="News" component={NewsScreen} /> */}
      <Tab.Screen name="Setting" component={SettingStackScreen} />
    </Tab.Navigator>
  );
};

const AppContainer = () => {
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const setTokenInfo = useSetRecoilState(tokenInfoAtom);
  const setAddressBook = useSetRecoilState(addressBookAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );
  const [language, setLanguage] = useRecoilState(languageAtom);
  const isLocalAuthed = useRecoilValue(localAuthAtom);
  const [localAuthEnabled, setLocalAuthEnabled] = useState(true);
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

  useEffect(() => {
    (async () => {
      // Get local auth setting
      const enabled = await getAppPasscodeSetting();
      if (!enabled) {
        setLocalAuthEnabled(false);
      }

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

      setInited(1);
    })();
  }, [
    setWallets,
    setTokenInfo,
    setAddressBook,
    setLanguage,
    setSelectedWallet,
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
        <NoWalletStackScreen />
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
