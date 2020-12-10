/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Text, View, TouchableOpacity, Dimensions, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {formatDistanceToNowStrict, isSameDay, format} from 'date-fns';
import QRCodeScanner from 'react-native-qrcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Button from '../../components/Button';
import {truncate} from '../../utils/string';
import {styles} from './style';
import HomeHeader from './Header';
import List from '../../components/List';
import Modal from '../../components/Modal';
import {useRecoilState} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {getWalletFromPK} from '../../utils/blockchain';
import {saveWallets} from '../../utils/local';
import AlertModal from '../../components/AlertModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {parseKaiBalance} from '../../utils/number';
import {getTxByAddress} from '../../services/transaction';
import {tokenInfoAtom} from '../../atoms/token';
import {ThemeContext} from '../../App';
const {width: viewportWidth} = Dimensions.get('window');

const HomeScreen = () => {
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );
  const [tokenInfo] = useRecoilState(tokenInfoAtom);
  const [showQRModal, setShowQRModal] = useState(false);
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const [txList, setTxList] = useState([] as any[]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScanAlert, setShowScanAlert] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanType, setScanType] = useState('warning');
  const carouselRef = useRef<Carousel<Wallet>>(null);

  const theme = useContext(ThemeContext);

  const navigation = useNavigation();

  function send() {
    navigation.navigate('Transaction', {screen: 'CreateTx', initial: false});
  }

  function importWallet() {
    setShowImportModal(true);
  }

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.triggerRenderingHack();
      carouselRef.current.snapToItem(selectedWallet);
    }
  }, [selectedWallet]);

  const removeWallet = (walletIndex: number) => {
    if (selectedWallet > wallets.length - 2) {
      setSelectedWallet(wallets.length);
    }
    const newWallets: Wallet[] = JSON.parse(JSON.stringify(wallets));
    newWallets.splice(walletIndex, 1);
    setWallets(newWallets);
    saveWallets(newWallets);
  };

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      status: tx.status,
      type:
        wallets[selectedWallet] && tx.from === wallets[selectedWallet].address
          ? 'OUT'
          : 'IN',
    };
  };

  const getTX = () => {
    getTxByAddress(wallets[selectedWallet].address, 1, 10).then((newTxList) =>
      setTxList(newTxList.map(parseTXForList)),
    );
  };

  useEffect(() => {
    if (wallets[selectedWallet]) {
      getTX();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  const renderWalletItem = ({item: wallet, index}: any) => {
    return (
      <View style={styles.kaiCardContainer}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          colors={['#623555', '#e62c2c']}
          style={styles.kaiCard}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{paddingRight: 8, flex: 10}}>
              <Text style={styles.kaiCardText}>Address:</Text>
              <Text style={styles.kaiCardText}>
                {truncate(wallet.address, 8, 10)}
              </Text>
            </View>
            <Menu>
              <MenuTrigger
                customStyles={{
                  triggerOuterWrapper: {
                    width: 27,
                    height: 27,
                    alignItems: 'flex-end',
                  },
                  TriggerTouchableComponent: TouchableOpacity,
                  triggerWrapper: {
                    width: 27,
                    height: 27,
                    alignItems: 'flex-end',
                  },
                }}>
                <Icon name="cog" color="#FFFFFF" size={27} />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionWrapper: {padding: 18},
                }}>
                <MenuOption onSelect={() => removeWallet(index)}>
                  <Text>Remove wallet</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          <View>
            <Text style={{fontSize: 30, color: 'white'}}>
              ${parseKaiBalance(tokenInfo.price * wallet.balance)}
            </Text>
            <Image
              style={styles.cardLogo}
              source={require('../../assets/kar1.png')}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.kaiCardText, styles.kaiCardBalanceText]}>
              {parseKaiBalance(wallet.balance)} KAI
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderIcon = (status: number) => {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            width: 50,
            height: 50,

            borderRadius: 25,
            backgroundColor: 'white',

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            borderWidth: 1,
            borderColor: 'gray',
          }}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.kaiLogo}
          />
          {status ? (
            <AntIcon
              name="checkcircle"
              size={20}
              color={'green'}
              style={{position: 'absolute', right: 0, bottom: 0}}
            />
          ) : (
            <AntIcon
              name="closecircle"
              size={20}
              color={'red'}
              style={{position: 'absolute', right: 0, bottom: 0}}
            />
          )}
        </View>
      </View>
    );
  };

  const onSuccessScan = (e: any) => {
    importPK(e.data);
    setShowImportModal(false);
  };

  const importPK = (privateKey: string) => {
    const wallet = getWalletFromPK(privateKey);
    const walletObj: Wallet = {
      address: wallet.getAddressString(),
      privateKey: wallet.getPrivateKeyString(),
      balance: 0,
    };

    const walletExisted = wallets
      .map((item) => item.address)
      .includes(walletObj.address);

    if (walletExisted) {
      setScanMessage('Wallet already imported');
      setScanType('warning');
      setShowScanAlert(true);
      return;
    }

    const newWallets = JSON.parse(JSON.stringify(wallets));
    newWallets.push(walletObj);

    setWallets(newWallets);
    saveWallets(newWallets);
    setTimeout(() => {
      setSelectedWallet(newWallets.length - 1);
    }, 400);
  };

  return (
    <SafeAreaView>
      <HomeHeader />
      <View style={styles.bodyContainer}>
        <View style={styles.kaiCardSlider}>
          <Carousel
            ref={carouselRef}
            data={wallets}
            renderItem={renderWalletItem}
            sliderWidth={viewportWidth}
            itemWidth={viewportWidth}
            onSnapToItem={setSelectedWallet}
            onBeforeSnapToItem={setSelectedWallet}
            removeClippedSubviews={false}
          />
          <Pagination
            dotsLength={wallets.length}
            activeDotIndex={selectedWallet}
            containerStyle={{
              paddingVertical: 0,
              height: 20,
              justifyContent: 'center',
            }}
            dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
            }}
            inactiveDotStyle={
              {
                // Define styles for inactive dots here
              }
            }
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
          />

          <View style={styles.buttonGroupContainer}>
            <Button
              title="Send"
              type="outline"
              onPress={send}
              iconName="paper-plane"
              size="small"
              textStyle={{color: '#FFFFFF'}}
              style={{marginRight: 5}}
            />

            <Button
              onPress={() => setShowQRModal(true)}
              title="Receive"
              size="small"
              type="outline"
              iconName="download"
              style={{marginLeft: 5, marginRight: 5}}
              textStyle={{color: '#FFFFFF'}}
            />

            <Button
              title="Import"
              onPress={importWallet}
              type="outline"
              iconName="plus"
              size="small"
              style={{marginLeft: 5}}
              textStyle={{color: '#FFFFFF'}}
            />
          </View>
        </View>
        <View style={styles.transactionContainer}>
          <List
            items={txList}
            listStyle={{paddingHorizontal: 15}}
            render={(item) => {
              return (
                <View style={[{padding: 15}]}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                    onPress={() =>
                      navigation.navigate('Transaction', {
                        screen: 'TransactionDetail',
                        initial: false,
                        params: {txHash: item.label},
                      })
                    }>
                    {renderIcon(item.status)}
                    <View
                      style={{
                        flex: 4,
                        flexDirection: 'column',
                        paddingHorizontal: 14,
                      }}>
                      <Text style={{color: '#FFFFFF'}}>
                        {truncate(item.label, 6, 10)}
                      </Text>
                      <Text style={{color: 'gray'}}>
                        {isSameDay(item.date, new Date())
                          ? `${formatDistanceToNowStrict(item.date)} ago`
                          : format(item.date, 'MMM d yyyy HH:mm')}
                      </Text>
                      {/* <Text style={{color: '#FFFFFF'}}>Success</Text> */}
                    </View>
                    <View
                      style={{
                        flex: 3,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}>
                      <Text
                        style={[
                          styles.kaiAmount,
                          item.type === 'IN'
                            ? {color: '#61b15a'}
                            : {color: 'red'},
                        ]}>
                        {item.type === 'IN' ? '+' : '-'}
                        {parseKaiBalance(item.amount)} KAI
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={[styles.noTXText, {color: theme.textColor}]}>
                No transaction
              </Text>
            }
            header={
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'}}>
                  Recent transactions
                </Text>
                <Button
                  type="link"
                  onPress={() =>
                    navigation.navigate('Transaction', {
                      screen: 'TransactionList',
                    })
                  }
                  title="View all >"
                />
              </View>
            }
          />
        </View>
        {showQRModal && (
          <Modal visible={true} onClose={() => setShowQRModal(false)}>
            <Text>Scan below QR code for address</Text>
            <QRCode
              size={viewportWidth / 1.5}
              value={wallets[selectedWallet].address}
              logo={require('../../assets/logo.png')}
              logoBackgroundColor="#FFFFFF"
              logoSize={35}
              logoMargin={5}
              logoBorderRadius={20}
            />
          </Modal>
        )}
        {showImportModal && (
          <Modal
            showCloseButton={false}
            visible={true}
            onClose={() => setShowImportModal(false)}>
            <Text>Scan QR Code for Private key</Text>
            <QRCodeScanner onRead={onSuccessScan} />
          </Modal>
        )}
        {showScanAlert && (
          <AlertModal
            type={scanType as any}
            visible={showScanAlert}
            onClose={() => setShowScanAlert(false)}
            message={scanMessage}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
