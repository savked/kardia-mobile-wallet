import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ImportWallet from './screens/ImportWallet';
import ImportMnemonic from './screens/ImportMnemonic';
import CreateWallet from './screens/CreateWallet';
import Welcome from './screens/Welcome';
import ImportPrivateKey from './screens/ImportPrivateKey';

const NoWalletStack = createStackNavigator()

const NoWalletStackScreen = () => {
    return (
        <NoWalletStack.Navigator headerMode="none">
            <NoWalletStack.Screen name="Welcome" component={Welcome} />
            <NoWalletStack.Screen name="ImportWallet" component={ImportWallet} />
            <NoWalletStack.Screen name="ImportMnemonic" component={ImportMnemonic} />
            <NoWalletStack.Screen name="ImportPrivateKey" component={ImportPrivateKey} />
            <NoWalletStack.Screen name="CreateWallet" component={CreateWallet} options={{ title: 'Create new wallet' }} />
        </NoWalletStack.Navigator>
    );
}

export default NoWalletStackScreen