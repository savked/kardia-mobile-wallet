import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import DAppBrowser from './screens/DAppBrowser';
import DAppHome from './screens/DAppHome';

const DAppStack = createStackNavigator();

const DAppStackScreen = () => {
  return (
    <DAppStack.Navigator
      headerMode="none"
      initialRouteName="DAppHome"
      // initialRouteName="DAppBrowser"
    >
      <DAppStack.Screen name="DAppHome" component={DAppHome} options={{headerShown: false}} />
      <DAppStack.Screen name="DAppBrowser" component={DAppBrowser} options={{headerShown: false}} />
    </DAppStack.Navigator>
  );
};

export default DAppStackScreen;
