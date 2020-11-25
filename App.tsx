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
import { StatusBar } from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/Home';
import TransactionScreen from './screens/Transactions';
import Icon from 'react-native-vector-icons/FontAwesome';
import NewsScreen from './screens/News';
import DAppScreen from './screens/DApp';

declare const global: {HermesInternal: null | {}};

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaProvider>
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
                } else if (route.name === 'DApp') {
                  iconName = 'th-large'
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
            <Tab.Screen name="DApp" component={DAppScreen} />
            <Tab.Screen name="News" component={NewsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </>
  );
};

export default App;
