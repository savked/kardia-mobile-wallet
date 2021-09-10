import React from 'react'
import {createStackNavigator} from '@react-navigation/stack';
import DualNode from './screens/DualNode';
import SuccessTx from './screens/SuccessTx';

const DualNodeStack = createStackNavigator();

const DualNodeStackScreen = () => {
  return (
    <DualNodeStack.Navigator
      headerMode="none"
      initialRouteName="DualNodeForm"
      // initialRouteName="DAppBrowser"
    >
      <DualNodeStack.Screen name="DualNodeForm" component={DualNode} options={{headerShown: false}} />
      <DualNodeStack.Screen name="SuccessTx" component={SuccessTx} />
    </DualNodeStack.Navigator>
  )
}

export default DualNodeStackScreen