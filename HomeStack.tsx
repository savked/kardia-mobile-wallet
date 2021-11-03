import React, {useContext} from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import HomeScreen from './screens/Home';
import TokenDetail from './screens/TokenDetail';
import {ThemeContext} from './ThemeContext';
import TokenTxDetail from './screens/TokenTxDetail';
import ImportWallet from './screens/ImportWallet';
import ImportMnemonic from './screens/ImportMnemonic';
import SelectWallet from './screens/SelectWallet';
import ImportPrivateKey from './screens/ImportPrivateKey';
import KRC20Tokens from './screens/KRC20Tokens';
import AddVerifiedKRC20Tokens from './screens/AddVerifiedKRC20Tokens';
import AddKRC20Tokens from './screens/AddKRC20Tokens';
import SettingStackScreen from './SettingStack';
import CreateWithMnemonicPhrase from './screens/CreateWithMnemonicPhrase';
import TransactionScreen from './screens/Transactions';
import SuccessTx from './screens/SuccessTx';
import AddressBookSetting from './screens/AddressBookSetting';
import AddressDetail from './screens/AddressDetail';
import AuthorizeAccess from './screens/AuthorizeAccess';
import SignTxFromExternal from './screens/SignTxFromExternal';

const HomeStack = createStackNavigator();

const HomeStackScreen = () => {
  const theme = useContext(ThemeContext);
  return (
    <HomeStack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          shadowColor: 'transparent',
          backgroundColor: theme.backgroundColor,
        },
        headerBackTitleVisible: false,
        headerShown: false,
      }}>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="KRC20Tokens"
        component={KRC20Tokens}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="TokenDetail"
        component={TokenDetail}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="TokenTxDetail"
        component={TokenTxDetail}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="NewKRC20Tokens"
        component={AddKRC20Tokens}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="AddVerifiedKRC20Tokens"
        component={AddVerifiedKRC20Tokens}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="CreateWithMnemonicPhrase"
        component={CreateWithMnemonicPhrase}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ImportWallet"
        component={ImportWallet}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ImportMnemonic"
        component={ImportMnemonic}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="SelectWallet"
        component={SelectWallet}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ImportPrivateKey"
        component={ImportPrivateKey}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="Setting"
        component={SettingStackScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="TransactionList"
        component={TransactionScreen}
      />
      <HomeStack.Screen name="SuccessTx" component={SuccessTx} />
      <HomeStack.Screen
        name="AddressBook"
        component={AddressBookSetting}
        options={{
          headerShown: false
        }}
      />
      <HomeStack.Screen
        name="AddressDetail"
        component={AddressDetail}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="AuthorizeAccess"
        component={AuthorizeAccess}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="SignTxFromExternal"
        component={SignTxFromExternal}
        options={{
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackScreen;
