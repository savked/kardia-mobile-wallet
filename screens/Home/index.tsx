import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Icon from "react-native-vector-icons/FontAwesome"
import QRCode from 'react-native-qrcode-svg';
import Button from '../../components/Button'
import { truncate } from '../../utils/string';
import { styles } from './style';
import HomeHeader from './Header';
import List from '../../components/List';
import Modal from "../../components/Modal"
import { useRecoilState } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';

const fakeWallets = [
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
    amount: 100,
    type: 'IN'
  },
  {
    label: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a72',
    value: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a72',
    amount: 100,
    type: 'IN'
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125646',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125646',
    amount: 100,
    type: 'OUT'
  },
  {
    label: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda558',
    value: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda558',
    amount: 100,
    type: 'IN'
  },
  {
    label: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a71',
    value: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a71',
    amount: 100,
    type: 'OUT'
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125645',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125645',
    amount: 100,
    type: 'OUT'
  },
  {
    label: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda557',
    value: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda557',
    amount: 100,
    type: 'OUT'
  },
  {
    label: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a73',
    value: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a73',
    amount: 100,
    type: 'IN'
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125644',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125644',
    amount: 100,
    type: 'IN'
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125649',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125649',
    amount: 100,
    type: 'IN'
  },
  {
    label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125650',
    value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125650',
    amount: 100,
    type: 'OUT'
  }
]

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window')

const HomeScreen = () => {

  const [selectedWallet, setSelectedWallet] = useRecoilState(selectedWalletAtom)
  const [showQRModal, setShowQRModal] = useState(false)
  const [wallets, setWallets] = useRecoilState(walletsAtom)

  function send() {
    console.log('send');
  }

  useEffect(() => {
    setWallets(fakeWallets)
  }, [])

  const navigation = useNavigation()

  const renderWalletItem = ({ item: wallet, index }: any) => {
    return (
      <View style={styles.kaiCardContainer}>
        <LinearGradient colors={['#42378f', '#f53844']} style={styles.kaiCard}>
          <View>
            <Text style={styles.kaiCardText}>Address:</Text>
            <Text style={styles.kaiCardText}>{truncate(wallet.address, 12, 20)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.kaiCardText, styles.kaiCardBalanceText]}>{wallet.balance} KAI
              <Text style={{ fontSize: 12 }}> ~ 100 USD</Text>
            </Text>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <SafeAreaView>
      <HomeHeader />
      <View style={styles.kaiCardSlider}>
        <Carousel
          data={wallets}
          renderItem={renderWalletItem}
          sliderWidth={viewportWidth}
          itemWidth={viewportWidth}
          onSnapToItem={setSelectedWallet}
        />
        <Pagination
          dotsLength={wallets.length}
          activeDotIndex={selectedWallet}
          containerStyle={{ paddingVertical: 0, height: 20, justifyContent: 'center' }}
          dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.92)'
          }}
          inactiveDotStyle={{
            // Define styles for inactive dots here
          }}
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
        />
        <View style={styles.buttonGroupContainer}>
          <Button
            title="Send"
            type="primary"
            onPress={send}
            iconName="paper-plane"
            size="large"
          />
          <Button onPress={() => setShowQRModal(true)} title="Receive" size="large" type="secondary" iconName="download" />
        </View>
      </View>
      <View style={{ height: 430 }}>
        <List
          items={txList}
          render={(item, index) => {
            return (
              <View style={{ padding: 15 }}>
                <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {
                    item.type === 'IN' && <Icon name="level-down" size={20} color="green" />
                  }
                  {
                    item.type === 'OUT' && <Icon name="level-up" size={20} color="#AD182A" />
                  }
                  <Text>{truncate(item.label, 10, 15)}</Text>
                  <Text>{item.amount} KAI</Text>
                </TouchableOpacity>
              </View>
            )
          }}
          header={
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Recent transactions</Text>
              <Button type="link" onPress={() => navigation.navigate('Transaction')} title="View all >" />
            </View>
          }
        />
      </View>
      {
        showQRModal &&
        <Modal visible={true} onClose={() => setShowQRModal(false)}>
          <Text>Scan below QR code for address</Text>
          <QRCode
            size={viewportWidth/2}
            value="http://awesome.link.qr"
          />
        </Modal>
      }
    </SafeAreaView>
  )
}

export default HomeScreen