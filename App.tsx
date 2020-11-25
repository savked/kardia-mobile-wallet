/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/Home';
import TransactionScreen from './screens/Transactions';
import Icon from 'react-native-vector-icons/FontAwesome';
import NewsScreen from './screens/News';

declare const global: {HermesInternal: null | {}};

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = '';
  
              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'News') {
                iconName = 'newspaper-o';
              } else if (route.name === 'Transaction') {
                iconName = 'exchange'
              }
  
              // You can return any component that you like here!
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Transaction" component={TransactionScreen} />
          <Tab.Screen name="News" component={NewsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
