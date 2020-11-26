import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import CreateTxScreen from './screens/CreateTransaction';
import TransactionScreen from './screens/Transactions';

const TransactionStack = createStackNavigator()

const TransactionStackScreen = () => {
    return (
        <TransactionStack.Navigator>
            <TransactionStack.Screen name="Transaction" component={TransactionScreen} options={{ title: 'Transaction history' }} />
            <TransactionStack.Screen name="CreateTx" component={CreateTxScreen} options={{ title: 'Create new transaction' }} />
        </TransactionStack.Navigator>
    );
}

export default TransactionStackScreen