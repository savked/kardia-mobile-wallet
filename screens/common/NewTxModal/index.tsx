/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  Keyboard,
  Dimensions,
} from 'react-native';
import {styles} from './style';
import AlertModal from '../../../components/AlertModal';
import Modal from '../../../components/Modal';
import TextInput from '../../../components/TextInput';
import {useRecoilState, useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import Button from '../../../components/Button';
import {getLanguageString, parseError} from '../../../utils/lang';
import {truncate} from '../../../utils/string';
import {selectedWalletAtom, walletsAtom} from '../../../atoms/wallets';
import {getBalance} from '../../../services/account';
import {createTx} from '../../../services/transaction';
import {saveWallets} from '../../../utils/local';
import {weiToKAI} from '../../../services/transaction/amount';
import ListCard from './ListCard';
import Icon from 'react-native-vector-icons/FontAwesome';
import {getDigit, isNumber, format} from '../../../utils/number';
import AddressBookModal from '../AddressBookModal';
import ScanQRAddressModal from '../ScanQRAddressModal';

const MAX_AMOUNT = 5000000000;

const {height: viewportHeight} = Dimensions.get('window');

const NewTxModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('0');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [gasPrice, setGasPrice] = useState(1);
  const [error, setError] = useState('');
  const [successTxHash, setSuccessHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorAddress, setErrorAddress] = useState(' ');
  const [errorAmount, setErrorAmount] = useState(' ');

  const language = useRecoilValue(languageAtom);

  async function send() {
    setShowConfirmModal(false);
    setLoading(true);
    const wallet = wallets[selectedWallet];
    const _txAmount = Number(amount.replace(/,/g, ''));
    try {
      const txHash = await createTx(wallet, address.trim(), _txAmount);
      const newBallance = await getBalance(wallet.address);
      const newWallets: Wallet[] = JSON.parse(JSON.stringify(wallets));

      newWallets[selectedWallet].balance = newBallance;
      setWallets(newWallets);
      saveWallets(newWallets);

      setSuccessHash(txHash);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.message) {
        setError(parseError(err.message, language));
      } else {
        console.error(err);
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

  const showConfirm = () => {
    setErrorAddress(' ');
    setErrorAmount(' ');
    let isValid = true;
    if (address === '') {
      setErrorAddress(getLanguageString(language, 'REQUIRED_FIELD'));
      isValid = false;
    }
    if (amount === '' || amount === '0') {
      setErrorAmount(getLanguageString(language, 'REQUIRED_FIELD'));
      isValid = false;
    }
    const wallet = wallets[selectedWallet];
    const _txAmount = Number(amount.replace(/,/g, ''));
    const currentBalance = Number(weiToKAI(wallet.balance));
    if (_txAmount > currentBalance) {
      setErrorAmount(getLanguageString(language, 'NOT_ENOUGH_KAI_FOR_TX'));
      isValid = false;
    }
    if (!isValid) {
      return;
    }
    setShowConfirmModal(true);
  };

  const resetState = () => {
    setAddress('');
    setAmount('0');
    setErrorAddress(' ');
    setErrorAmount(' ');
  };

  if (showQRModal) {
    return (
      <ScanQRAddressModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        onScanned={(_address) => {
          setAddress(_address);
          setShowQRModal(false);
        }}
      />
    );
  }

  if (showAddressBookModal) {
    return (
      <AddressBookModal
        visible={showAddressBookModal}
        onClose={() => setShowAddressBookModal(false)}
        onSelectAddress={(_address: string) => {
          setAddress(_address);
          setShowAddressBookModal(false);
        }}
      />
    );
  }

  if (showConfirmModal) {
    return (
      <Modal
        showCloseButton={false}
        visible={showConfirmModal}
        contentStyle={{flex: 0.3, marginTop: viewportHeight / 3}}
        onClose={() => setShowConfirmModal(false)}>
        <Text style={styles.confirmTitle}>
          {getLanguageString(language, 'CONFIRM_TRANSACTION')}
        </Text>
        <View>
          <View style={styles.confirmGroup}>
            <Text style={styles.confirmText}>
              {getLanguageString(language, 'CREATE_TX_ADDRESS')}:{' '}
            </Text>
            <Text style={styles.confirmContent}>
              {truncate(address, 10, 10)}
            </Text>
          </View>
          <View style={styles.confirmGroup}>
            <Text style={styles.confirmText}>
              {getLanguageString(language, 'CONFIRM_KAI_AMOUNT')}:{' '}
            </Text>
            <Text style={styles.confirmContent}>{amount} KAI</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            width: '100%',
          }}>
          <Button
            title={getLanguageString(language, 'GO_BACK')}
            onPress={() => setShowConfirmModal(false)}
            type="ghost"
          />
          <Button
            title={getLanguageString(language, 'CONFIRM')}
            onPress={send}
            type="primary"
          />
        </View>
      </Modal>
    );
  }

  if (successTxHash !== '') {
    return (
      <AlertModal
        type="success"
        // message={`Transaction completed. Hash: ${successTxHash}`}
        onClose={() => {
          setSuccessHash('');
          onClose();
        }}
        visible={successTxHash !== ''}>
        <Text>Transaction completed</Text>
        <Text>Tx Hash: {truncate(successTxHash, 10, 20)}</Text>
      </AlertModal>
    );
  }
  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetState();
        onClose();
      }}
      showCloseButton={true}
      contentStyle={{
        paddingHorizontal: 0,
        marginTop: viewportHeight / 3,
      }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={[styles.container]}>
          <View style={{marginBottom: 10}}>
            <TextInput
              headlineStyle={{color: 'black'}}
              onChangeText={setAddress}
              message={errorAddress}
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
              headlineStyle={{color: 'black'}}
              keyboardType="numeric"
              message={errorAmount}
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

          <Text style={[styles.title, {marginBottom: 12}]}>
            {getLanguageString(language, 'TRANSACTION_SPEED')}
          </Text>
          <View style={{marginBottom: 20}}>
            <ListCard gasPrice={gasPrice} selectGasPrice={setGasPrice} />
          </View>

          <View>
            <View style={styles.wrap}>
              <View>
                <Text>{getLanguageString(language, 'GAS_PRICE')}</Text>
                <Text>{gasPrice} Oxy</Text>
              </View>
              <View>
                <Text>{getLanguageString(language, 'GAS_LIMIT')}</Text>
                <Text style={{textAlign: 'right'}}>29,000</Text>
              </View>
            </View>
          </View>

          {/* <Text style={[{marginTop: 20, fontStyle: 'italic'}]}>
            {getLanguageString(language, 'SPEED_DESCRIPTION')}
          </Text> */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              justifyContent: 'space-around',
            }}>
            <Button
              title={getLanguageString(language, 'SEND').toUpperCase()}
              onPress={showConfirm}
              iconName="paper-plane"
              block
              type="primary"
              size="large"
              loading={loading}
              disabled={loading}
            />
          </View>
          <AlertModal
            type="error"
            message={error}
            onClose={() => setError('')}
            visible={error !== ''}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NewTxModal;
