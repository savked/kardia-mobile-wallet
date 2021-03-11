import React, {useContext} from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import HomeScreen from './screens/Home';
import TokenDetail from './screens/TokenDetail';
import {ThemeContext} from './ThemeContext';
import TokenTxDetail from './screens/TokenTxDetail';

const HomeStack = createStackNavigator();

const HomeStackScreen = () => {
  const theme = useContext(ThemeContext);
  return (
    <HomeStack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          shadowColor: 'transparent',
          backgroundColor: theme.backgroundColor,
        },
        headerBackTitleVisible: false,
      }}>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="TokenDetail"
        component={TokenDetail}
        options={({route}) => {
          let title = '';
          if (route && route.params && (route.params as any).name) {
            title = `${(route.params as any).name} (${
              (route.params as any).symbol
            })`;
          }
          return {
            title,
            headerTitleStyle: {
              color: theme.textColor,
            },
            headerTintColor: theme.textColor,
          };
        }}
      />
      <HomeStack.Screen
        name="TokenTxDetail"
        component={TokenTxDetail}
        options={{headerShown: false}}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackScreen;
