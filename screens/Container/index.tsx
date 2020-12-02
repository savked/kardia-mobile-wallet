import React, { useEffect, useState } from 'react'
import { View, Image } from 'react-native'
import { useRecoilState } from 'recoil'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { walletsAtom } from '../../atoms/wallets';
import HomeScreen from '../Home';
import NewsScreen from '../News';
import DAppScreen from '../DApp';
import TransactionStackScreen from '../../TransactionStack'
import { getWallets } from '../../utils/local';
import { styles } from './style';
import NoWalletStackScreen from '../../NoWalletStack';

const Tab = createBottomTabNavigator();

const AppContainer = () => {

  const [wallets, setWallets] = useRecoilState(walletsAtom)
  const [inited, setInited] = useState(0)

  useEffect(() => {
    (async () => {
      const localWallets = await getWallets()
      setWallets(localWallets)
      setInited(1)
    })()
  }, [])

  if (!inited) {
    return (
      <View style={styles.splashContainer}>
        <Image style={styles.splashLogo} source={require('../../assets/kardia-logo-full-white.png')} />
      </View>
    )
  }

  if (wallets.length === 0) {
    return (
      <NavigationContainer>
        <NoWalletStackScreen />
      </NavigationContainer>
    )
  }

  return (
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
          activeTintColor: '#EA425C',
          inactiveTintColor: '#7A859A',
          inactiveBackgroundColor: '#171E28',
          activeBackgroundColor: '#171E28',
          keyboardHidesTabBar: true,
          tabStyle: {
            backgroundColor: '#171E28',
            borderTopColor: '#171E28'
          },
          labelStyle: {
            fontWeight: 'bold'
          },
          style: {
            backgroundColor: '#171E28',
            borderTopColor: '#171E28'
          }
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Transaction" component={TransactionStackScreen} />
        <Tab.Screen name="DApp" component={DAppScreen} />
        <Tab.Screen name="News" component={NewsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default AppContainer