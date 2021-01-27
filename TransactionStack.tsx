import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
// import CreateTxScreen from './screens/CreateTransaction';
import TransactionScreen from './screens/Transactions';
import TransactionDetail from './screens/TransactionDetail';

const TransactionStack = createStackNavigator();

const TransactionStackScreen = () => {
  return (
    <TransactionStack.Navigator
      initialRouteName="TransactionList"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <TransactionStack.Screen
        name="TransactionList"
        component={TransactionScreen}
      />
      {/* <TransactionStack.Screen name="CreateTx" component={CreateTxScreen} /> */}
      <TransactionStack.Screen
        name="TransactionDetail"
        component={TransactionDetail}
      />
    </TransactionStack.Navigator>
  );
};

export default TransactionStackScreen;
