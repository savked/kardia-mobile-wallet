import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { Image, Text, View } from 'react-native';
import Button from '../../components/Button';
import { styles } from './style';

const Welcome = () => {

  const navigation = useNavigation()

  return (
    <View style={styles.noWalletContainer}>
      <View>
        <Image style={styles.noWalletLogo} source={require('../../assets/logo.png')} />
      </View>
      <View>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 7 }}>Welcome to Kardia Wallet</Text>
        <Text style={{ fontSize: 14 }}>To get started, choose one of the following options</Text>
      </View>
      <View style={{ height: 140, justifyContent: 'space-evenly' }}>
        <Button size="large" title="Create new wallet" type="primary" onPress={() => navigation.navigate('CreateWallet')} style={{ width: 300 }} />
        <Button size="large" title="Import your wallet" type="secondary" onPress={() => navigation.navigate('ImportWallet')} />
      </View>
    </View>
  )
}

export default Welcome;