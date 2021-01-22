import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import NewStaking from './screens/NewStaking';
import StakingScreen from './screens/Staking';

const StakingStack = createStackNavigator();

const StakingStackScreen = () => {
  return (
    <StakingStack.Navigator
      initialRouteName="StakingList"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <StakingStack.Screen name="StakingList" component={StakingScreen} />
      <StakingStack.Screen name="NewStaking" component={NewStaking} />
    </StakingStack.Navigator>
  );
};

export default StakingStackScreen;
