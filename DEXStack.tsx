/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {ThemeContext} from './ThemeContext';
import SuccessTx from './screens/SuccessTx';
import Trade from './screens/KAIDex/Trade';
import AddLiquidity from './screens/KAIDex/AddLiquidity';
import OrderHistory from './screens/KAIDex/OrderHistory';

const DEXStack = createStackNavigator();

const DEXStackScreen = () => {
  const theme = useContext(ThemeContext);
  return (
    <DEXStack.Navigator
      initialRouteName="Trade"
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          shadowColor: 'transparent',
          backgroundColor: theme.backgroundColor,
        },
        headerBackTitleVisible: false,
      }}>
      <DEXStack.Screen
        name="Trade"
        component={Trade}
        options={{
          headerShown: false,
          animationEnabled: false
        }}
      />
      <DEXStack.Screen
        name="AddLiquidity"
        component={AddLiquidity}
        options={{
          headerShown: false,
          animationEnabled: false
        }}
      />
      <DEXStack.Screen
        name="OrderHistory"
        component={OrderHistory}
        options={{
          headerShown: false,
          animationEnabled: false
        }}
      />
      <DEXStack.Screen
        name="SuccessTx"
        component={SuccessTx}
        options={{
          headerShown: false
        }}
      />
    </DEXStack.Navigator>
  );
};

export default DEXStackScreen;
