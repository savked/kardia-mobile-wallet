import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ImportMnemonic from './screens/ImportMnemonic';
import Welcome from './screens/Welcome';
import CreateWithMnemonicPhrase from './screens/CreateWithMnemonicPhrase';

const NoWalletStack = createStackNavigator();

const NoWalletStackScreen = () => {
  return (
    <NoWalletStack.Navigator headerMode="none">
      <NoWalletStack.Screen name="Welcome" component={Welcome} />
      <NoWalletStack.Screen name="ImportMnemonic" component={ImportMnemonic} />
      <NoWalletStack.Screen
        name="CreateWallet"
        component={CreateWithMnemonicPhrase}
      />
    </NoWalletStack.Navigator>
  );
};

export default NoWalletStackScreen;
