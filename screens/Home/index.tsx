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
import { getTXHistory } from '../../services/api';

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

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window')

const HomeScreen = () => {

  const [selectedWallet, setSelectedWallet] = useRecoilState(selectedWalletAtom)
  const [showQRModal, setShowQRModal] = useState(false)
  const [wallets, setWallets] = useRecoilState(walletsAtom)
  const [txList, setTxList] = useState([] as any[])

  const navigation = useNavigation()

  function send() {
    navigation.navigate('Transaction', {screen: 'CreateTx'});
  }

  function importWallet() {

  }

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      type: wallets[selectedWallet] && tx.from === wallets[selectedWallet].address ? 'OUT' : 'IN'
    }
  }

  const getTX = () => {
    getTXHistory()
      .then(txList => setTxList(txList.map(parseTXForList)))
  }

  useEffect(() => {
    setWallets(fakeWallets)
  }, [])

  useEffect(() => {
    getTX()
  }, [selectedWallet])

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
      <View style={styles.bodyContainer}>
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
              size="small"
            />
            <Button onPress={() => setShowQRModal(true)} title="Receive" size="small" type="secondary" iconName="download" />
            <Button
              title="Import"
              onPress={importWallet}
              type="outline"
              iconName="plus"
              size="small"
              textStyle={{color: '#FFFFFF'}}
            />
          </View>
        </View>
        <View style={styles.transactionContainer}>
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
                    <Text style={styles.kaiAmount}>{item.amount} KAI</Text>
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
              size={viewportWidth/1.5}
              value={wallets[selectedWallet].address}
              logo={require('../../assets/logo.png')}
              logoBackgroundColor='#FFFFFF'
              logoSize={35}
              logoMargin={5}
              logoBorderRadius={20}
            />
          </Modal>
        }
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen