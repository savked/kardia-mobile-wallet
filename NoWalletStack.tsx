import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ImportMnemonic from './screens/ImportMnemonic';
import Welcome from './screens/Welcome';
import CreateWithMnemonicPhrase from './screens/CreateWithMnemonicPhrase';
import SelectWallet from './screens/SelectWallet';
import ImportWallet from './screens/ImportWallet';
import ImportPrivateKey from './screens/ImportPrivateKey';

const NoWalletStack = createStackNavigator();

const NoWalletStackScreen = () => {
  return (
    <NoWalletStack.Navigator headerMode="none">
      <NoWalletStack.Screen name="Welcome" component={Welcome} />
      <NoWalletStack.Screen name="ImportWallet" component={ImportWallet} />
      <NoWalletStack.Screen name="ImportPrivateKey" component={ImportPrivateKey} />
      <NoWalletStack.Screen name="ImportMnemonic" component={ImportMnemonic} />
      <NoWalletStack.Screen
        name="CreateWallet"
        component={CreateWithMnemonicPhrase}
      />
      <NoWalletStack.Screen
        name="SelectWallet"
        component={SelectWallet}
        options={{headerShown: false}}
      />
    </NoWalletStack.Navigator>
  );
};

export default NoWalletStackScreen;
