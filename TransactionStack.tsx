import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import CreateTxScreen from './screens/CreateTransaction';
import TransactionScreen from './screens/Transactions';
import TransactionDetail from './screens/TransactionDetail';

const TransactionStack = createStackNavigator()

const TransactionStackScreen = () => {
    return (
        <TransactionStack.Navigator>
            <TransactionStack.Screen name="TransactionList" component={TransactionScreen} options={{ title: 'Transaction history' }} />
            <TransactionStack.Screen name="CreateTx" component={CreateTxScreen} options={{headerShown: false}} />
            <TransactionStack.Screen name="TransactionDetail" component={TransactionDetail} options={{headerShown: false}} />
        </TransactionStack.Navigator>
    );
}

export default TransactionStackScreen