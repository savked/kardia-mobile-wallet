/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {styles} from './style';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import {useNavigation} from '@react-navigation/native';
import {truncate} from '../../utils/string';
import {format, getDigit, isNumber} from '../../utils/number';
import {ThemeContext} from '../../App';
import {useRecoilState, useRecoilValue} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {createTx} from '../../services/transaction';
import AlertModal from '../../components/AlertModal';
import {getBalance} from '../../services/account';
import {saveWallets} from '../../utils/local';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from '../../components/Modal';
import List from '../../components/List';
import {addressBookAtom} from '../../atoms/addressBook';
import TextAvatar from '../../components/TextAvatar';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
import {SafeAreaView} from 'react-native-safe-area-context';

const MAX_AMOUNT = 5000000000;

const CreateTxScreen = () => {
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const addressBook = useRecoilValue(addressBookAtom);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('0');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [gasPrice, setGasPrice] = useState(1);
  const [error, setError] = useState('');
  const [successTxHash, setSuccessHash] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);

  async function send() {
    setLoading(true);
    const wallet = wallets[selectedWallet];
    try {
      const txHash = await createTx(wallet, address, Number(amount));
      const newBallance = await getBalance(wallet.address);
      const newWallets: Wallet[] = JSON.parse(JSON.stringify(wallets));

      newWallets[selectedWallet].balance = newBallance;
      setWallets(newWallets);
      saveWallets(newWallets);

      setSuccessHash(txHash);
      setLoading(false);
    } catch (err) {
      if (err.message) {
        setError(err.message);
      } else {
        console.log(err);
        setError('Error happen');
      }
      setLoading(false);
    }
  }

  const showQRScanner = () => {
    setShowQRModal(true);
  };

  const showAddressBookSelector = () => {
    setShowAddressBookModal(true);
  };

  if (showQRModal) {
    return (
      <>
        <View style={styles.qrScannerHeader}>
          <Text style={styles.centerText}>Scan address QR code</Text>
        </View>
        <QRCodeScanner
          onRead={(e) => {
            setAddress(e.data);
            setShowQRModal(false);
          }}
          showMarker={true}
        />
        <View style={styles.qrScannerFooter}>
          <Button
            size="large"
            title="Cancel"
            onPress={() => setShowQRModal(false)}
          />
        </View>
      </>
    );
  }

  if (showAddressBookModal) {
    return (
      <Modal full visible={true} onClose={() => setShowAddressBookModal(false)}>
        <Text>Select Address</Text>
        <List
          items={addressBook}
          keyExtractor={(item) => item.address}
          render={(_address: Address) => {
            return (
              <TouchableOpacity
                style={styles.addressContainer}
                onPress={() => {
                  setAddress(_address.address);
                  setShowAddressBookModal(false);
                }}>
                <View style={styles.addressAvatarContainer}>
                  {_address.avatar ? (
                    <Image source={{uri: _address.avatar}} />
                  ) : (
                    <TextAvatar text={_address.name} />
                  )}
                </View>
                <View>
                  <Text style={[styles.addressName, {color: '#000000'}]}>
                    {_address.name}
                  </Text>
                  <Text style={[styles.addressHash, {color: '#000000'}]}>
                    {truncate(_address.address, 20, 20)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyAddressBook, {color: theme.textColor}]}>
              No saved address
            </Text>
          }
        />
      </Modal>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <View style={{marginBottom: 10}}>
          <TextInput
            onChangeText={setAddress}
            value={truncate(address, 10, 20)}
            headline={getLanguageString(language, 'CREATE_TX_ADDRESS')}
            icons={() => {
              return (
                <>
                  <Icon
                    onPress={showQRScanner}
                    name="qrcode"
                    size={25}
                    color={'black'}
                    style={[styles.textIcon, {right: 45}]}
                  />
                  <Icon
                    onPress={showAddressBookSelector}
                    name="address-book"
                    size={25}
                    color={'black'}
                    style={[styles.textIcon, {right: 15}]}
                  />
                </>
              );
            }}
          />
        </View>

        <View style={{marginBottom: 20}}>
          <TextInput
            onChangeText={(newAmount) => {
              const digitOnly = getDigit(newAmount);
              if (Number(digitOnly) > MAX_AMOUNT) {
                return;
              }
              if (digitOnly === '') {
                setAmount('0');
                return;
              }
              isNumber(digitOnly) && setAmount(digitOnly);
            }}
            onBlur={() => setAmount(format(Number(amount)))}
            value={amount}
            headline={getLanguageString(language, 'CREATE_TX_KAI_AMOUNT')}
          />
        </View>

        <Text
          style={[styles.title, {color: theme.textColor, marginBottom: 12}]}>
          {getLanguageString(language, 'TRANSACTION_SPEED')}
        </Text>
        <View style={{marginBottom: 20}}>
          <ListCard gasPrice={gasPrice} selectGasPrice={setGasPrice} />
        </View>

        <View>
          <View style={styles.wrap}>
            <View>
              <Text style={[{color: theme.textColor}]}>
                {getLanguageString(language, 'GAS_PRICE')}
              </Text>
              <Text style={[{color: theme.textColor}]}>{gasPrice} Oxy</Text>
            </View>
            <View>
              <Text style={[{color: theme.textColor}]}>
                {getLanguageString(language, 'GAS_LIMIT')}
              </Text>
              <Text style={[{color: theme.textColor}]}>21.000</Text>
            </View>
          </View>
        </View>

        <Text
          style={[
            {marginTop: 20, fontStyle: 'italic'},
            {color: theme.textColor},
          ]}>
          {getLanguageString(language, 'SPEED_DESCRIPTION')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 20,
            justifyContent: 'space-around',
          }}>
          <Button
            title={getLanguageString(language, 'SEND').toUpperCase()}
            onPress={send}
            iconName="paper-plane"
            type="primary"
            size="large"
            loading={loading}
          />
          <Button
            title={getLanguageString(language, 'GO_BACK').toUpperCase()}
            onPress={() => navigation.goBack()}
            type="outline"
            size="large"
          />
        </View>
        {error !== '' && (
          <AlertModal
            type="error"
            message={error}
            onClose={() => setError('')}
            visible={true}
          />
        )}
        {successTxHash !== '' && (
          <AlertModal
            type="success"
            // message={`Transaction completed. Hash: ${successTxHash}`}
            onClose={() => {
              setSuccessHash('');
              navigation.goBack();
            }}
            visible={true}>
            <Text>Transaction completed</Text>
            <Text>Tx Hash: {truncate(successTxHash, 10, 20)}</Text>
          </AlertModal>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const ListCard = ({
  gasPrice,
  selectGasPrice,
}: {
  gasPrice: number;
  selectGasPrice: (gasPrice: number) => void;
}) => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const data = [
    {
      title: getLanguageString(language, 'SLOW_SPEED'),
      time: `~30 ${getLanguageString(language, 'SECOND')}`,
      gasPrice: 1,
    },
    {
      title: getLanguageString(language, 'AVERAGE_SPEED'),
      time: `~20 ${getLanguageString(language, 'SECOND')}`,
      gasPrice: 2,
    },
    {
      title: getLanguageString(language, 'FAST_SPEED'),
      time: `~10 ${getLanguageString(language, 'SECOND')}`,
      gasPrice: 3,
    },
  ];

  return (
    <View style={styles.listCard}>
      {data.map((item, index) => {
        const active = item.gasPrice === gasPrice;
        return (
          <TouchableOpacity
            key={`tx-speed-${index}`}
            onPress={() => selectGasPrice(item.gasPrice)}
            style={{
              backgroundColor: active ? theme.primaryColor : 'white',
              padding: 20,
              borderRadius: 8,
              width: '30%',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: active ? theme.primaryTextColor : theme.ghostTextColor,
              }}>
              {item.title}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: active ? theme.primaryTextColor : theme.ghostTextColor,
              }}>
              {item.time}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
export default CreateTxScreen;
