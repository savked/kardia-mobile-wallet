import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import DAppBrowser from './screens/DAppBrowser';

const DAppStack = createStackNavigator();

const DAppStackScreen = () => {
  return (
    <DAppStack.Navigator headerMode="none">
      <DAppStack.Screen name="DAppBrowser" component={DAppBrowser} options={{headerShown: false}} />
    </DAppStack.Navigator>
  );
};

export default DAppStackScreen;
