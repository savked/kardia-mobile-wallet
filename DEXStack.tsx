/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {ThemeContext} from './ThemeContext';
import KAIDex from './screens/KAIDex';
import SuccessTx from './screens/SuccessTx';

const DEXStack = createStackNavigator();

const DEXStackScreen = () => {
  const theme = useContext(ThemeContext);
  return (
    <DEXStack.Navigator
      initialRouteName="DEXHome"
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          shadowColor: 'transparent',
          backgroundColor: theme.backgroundColor,
        },
        headerBackTitleVisible: false,
      }}>
      <DEXStack.Screen
        name="DEXHome"
        component={KAIDex}
        options={{
          headerShown: false
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
