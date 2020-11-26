import React from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/Button'
import { truncate } from '../../utils/string';
import { styles } from './style';
import HomeHeader from './Header';
import List from '../../components/List';

const wallets = [
  {
    address: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
    balance: 123
  },
  {
    address: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
    balance: 456
  }
]

const txList = [
  {
    label: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda559',
    value: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda559',
    amount: 100
  },
  {
    label: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a72',
    value: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a72',
    amount: 100
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125646',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125646',
    amount: 100
  },
  {
    label: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda558',
    value: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda558',
    amount: 100
  },
  {
    label: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a71',
    value: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a71',
    amount: 100
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125645',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125645',
    amount: 100
  },
  {
    label: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda557',
    value: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda557',
    amount: 100
  },
  {
    label: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a73',
    value: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a73',
    amount: 100
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125644',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125644',
    amount: 100
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125649',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125649',
    amount: 100
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125650',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125650',
    amount: 100
  }
]

const HomeScreen = () => {
  function send() {
    console.log('send');
  }

  function receive() {
    console.log('receive');
  }

  return (
    <SafeAreaView>
      <HomeHeader />
      <View style={styles.kaiCardSlider}>
        <View style={styles.kaiCardContainer}>
          <LinearGradient colors={['#42378f', '#f53844']} style={styles.kaiCard}>
            <View>
              <Text style={styles.kaiCardText}>Address:</Text>
              <Text style={styles.kaiCardText}>{ truncate(wallets[0].address, 12, 20) }</Text>
            </View>
            <View>
              <Text style={[styles.kaiCardText, styles.kaiCardBalanceText]}>{wallets[0].balance} KAI 
                <Text style={{fontSize: 12}}> ~ 100 USD</Text>
              </Text>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.buttonGroupContainer}>
          <Button 
            title="Send" 
            type="primary" 
            onPress={send}
            iconName="paper-plane"
            size="large"
          />
          <Button title="Receive" size="large" type="secondary" onPress={receive} iconName="download" />
        </View>
      </View>
      <View style={{height: 420}}>
        <List
          items={txList}
          render={(item, index) => {
            return (
              <View style={{padding: 15}}>
                <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text>{ truncate(item.label, 10, 15) }</Text>
                  <Text>{item.amount} KAI</Text>
                </TouchableOpacity>
              </View>
            )
          }}
          header={
            <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 18}}>Recent transactions</Text>
              <Button type="link" onPress={() => console.log('tx')} title="View all >" />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen