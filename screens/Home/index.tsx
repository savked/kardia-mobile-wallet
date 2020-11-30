import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import QRCodeScanner from 'react-native-qrcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import Button from '../../components/Button'
import { addZero, truncate } from '../../utils/string';
import { styles } from './style';
import HomeHeader from './Header';
import List from '../../components/List';
import Modal from "../../components/Modal"
import { useRecoilState } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import { getTXHistory } from '../../services/api';
import { getMonthName } from '../../utils/date';
import { getWalletFromPK } from '../../utils/blockchain';
import { saveWallets } from '../../utils/local';
import AlertModal from '../../components/AlertModal';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window')

const HomeScreen = () => {

  const [selectedWallet, setSelectedWallet] = useRecoilState(selectedWalletAtom)
  const [showQRModal, setShowQRModal] = useState(false)
  const [wallets, setWallets] = useRecoilState(walletsAtom)
  const [txList, setTxList] = useState([] as any[])
  const [showImportModal, setShowImportModal] = useState(false)
  const [showScanAlert, setShowScanAlert] = useState(false)
  const [scanMessage, setScanMessage] = useState('')
  const [scanType, setScanType] = useState('warning')

  const navigation = useNavigation()

  function send() {
    navigation.navigate('Transaction', { screen: 'CreateTx' });
  }

  function importWallet() {
    setShowImportModal(true)
  }

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      type: wallets[selectedWallet] && tx.from === wallets[selectedWallet].address ? 'OUT' : 'IN'
    }
  }

  const getTX = () => {
    getTXHistory(wallets[selectedWallet])
      .then(txList => setTxList(txList.map(parseTXForList)))
  }

  useEffect(() => {
    // setWallets(fakeWallets)
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

  const renderDate = (date: Date) => {
    const dateStr = addZero(date.getDate())
    const monthStr = getMonthName(date.getMonth() + 1)
    return (
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.dateText}>{monthStr}</Text>
      </View>
    )
  }

  const onSuccessScan = (e: any) => {
    importPK(e.data)
    setShowImportModal(false)
  }

  const importPK = (privateKey: string) => {
    const wallet = getWalletFromPK(privateKey)
    const walletObj: Wallet = {
      address: wallet.getAddressString(),
      balance: 0
    }

    const walletExisted = wallets.map((item) => item.address).includes(walletObj.address)

    if (walletExisted) {
      // Alert.alert('Wallet already imported')
      setScanMessage('Wallet already imported')
      setScanType('warning')
      setShowScanAlert(true)
      return;
    }

    const newWallets = JSON.parse(JSON.stringify(wallets))
    newWallets.push(walletObj)

    setWallets(newWallets)
    saveWallets(newWallets)
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
              textStyle={{ color: '#FFFFFF' }}
            />
          </View>
        </View>
        <View style={styles.transactionContainer}>
          <List
            items={txList}
            listStyle={{ paddingHorizontal: 15 }}
            render={(item, index) => {
              return (
                <View style={[{ padding: 15 }, index % 2 === 0 ? { backgroundColor: 'rgba(0,0,0,0.04)' } : { backgroundColor: '#FFFFFF' }]}>
                  <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {renderDate(item.date)}
                    <Text>{truncate(item.label, 10, 15)}</Text>
                    <Text
                      style={
                        [styles.kaiAmount, item.type === 'IN' ? { color: 'green' } : { color: 'red' }]
                      }
                    >
                      {item.type === 'IN' ? '+' : '-'}{item.amount} KAI
                    </Text>
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
              size={viewportWidth / 1.5}
              value={wallets[selectedWallet].address}
              logo={require('../../assets/logo.png')}
              logoBackgroundColor='#FFFFFF'
              logoSize={35}
              logoMargin={5}
              logoBorderRadius={20}
            />
          </Modal>
        }
        {
          showImportModal &&
          <Modal showCloseButton={false} visible={true} onClose={() => setShowImportModal(false)}>
            <Text>Scan QR Code for Private key</Text>
            <QRCodeScanner
              onRead={onSuccessScan}
            />
          </Modal>
        }
        {
          showScanAlert && 
          <AlertModal
            type={scanType as any}
            visible={showScanAlert}
            onClose={() => setShowScanAlert(false)}
            message={scanMessage}
          />
        }
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen