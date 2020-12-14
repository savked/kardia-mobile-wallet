/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
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

const MAX_AMOUNT = 5000000000;

const CreateTxScreen = () => {
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const addressBook = useRecoilValue(addressBookAtom);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('0');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [error, setError] = useState('');
  const [successTxHash, setSuccessHash] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

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
      <QRCodeScanner
        onRead={(e) => {
          setAddress(e.data);
          setShowQRModal(false);
        }}
        topContent={<Text style={styles.centerText}>Scan address QR code</Text>}
        bottomContent={
          <Button
            style={{marginTop: 50}}
            title="Cancel"
            onPress={() => setShowQRModal(false)}
          />
        }
      />
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
    <View
      style={[styles.container, {backgroundColor: theme.backgroundFocusColor}]}>
      <View style={{marginBottom: 10}}>
        <TextInput
          onChangeText={setAddress}
          value={truncate(address, 10, 20)}
          // iconName="qrcode"
          // onIconPress={showQRScanner}
          headline="Send to address"
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
          value={format(Number(amount))}
          headline="Amount (maximum: 5,000,000,000)"
        />
      </View>

      <View style={{marginBottom: 20}}>
        <Text style={[styles.title, {color: theme.textColor}]}>
          Recap of your transaction
        </Text>
        <View style={styles.wrap}>
          <View>
            <Text style={[{color: theme.textColor}]}>Gas Price</Text>
            <Text style={[{color: theme.textColor}]}>300 GWEI</Text>
          </View>
          <View>
            <Text style={[{color: theme.textColor}]}>Gas Limit</Text>
            <Text style={[{color: theme.textColor}]}>21.000 WEI</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.title, {color: theme.textColor}]}>
        Transaction Speed
      </Text>
      <View>
        <ListCard />
      </View>

      <Text
        style={[
          {marginTop: 20, fontStyle: 'italic'},
          {color: theme.textColor},
        ]}>
        * Accelerating a transaction by using a higher gas price increases its{' '}
        chances of getting processed by the network faster, but it is not always
        guaranteed.
      </Text>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 20,
          justifyContent: 'space-around',
        }}>
        <Button
          title="SEND"
          onPress={send}
          iconName="paper-plane"
          type="primary"
          size="large"
          loading={loading}
        />
        <Button
          title="CANCEL"
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
    </View>
  );
};

const data = [
  {
    title: 'Slow',
    time: '~30 sec',
  },
  {
    title: 'Average',
    time: '~20 sec',
  },
  {
    title: 'Fast',
    time: '~10 sec',
  },
];

const ListCard = () => {
  return (
    <FlatList
      contentContainerStyle={styles.listCard}
      data={data}
      renderItem={({item}) => {
        return (
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 8,
            }}>
            <Text style={{textAlign: 'center'}}>{item.title}</Text>
            <Text>{item.time}</Text>
          </View>
        );
      }}
      keyExtractor={(item) => item.title}
      ListEmptyComponent={<Text>No data</Text>}
    />
  );
};
export default CreateTxScreen;
