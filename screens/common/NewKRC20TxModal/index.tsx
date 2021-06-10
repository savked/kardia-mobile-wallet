/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  Keyboard,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {styles} from './style';
import AlertModal from '../../../components/AlertModal';
import Modal from '../../../components/Modal';
import TextInput from '../../../components/TextInput';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import Button from '../../../components/Button';
import {getLanguageString, parseError} from '../../../utils/lang';
import {getFromClipboard, toChecksum, truncate} from '../../../utils/string';
import {selectedWalletAtom, walletsAtom} from '../../../atoms/wallets';
import {
  getBalance as getKRC20Balance,
  transferKRC20,
} from '../../../services/krc20';
import {getSelectedWallet, getWallets} from '../../../utils/local';
import ListCard from './ListCard';
// import Icon from 'react-native-vector-icons/FontAwesome';
import {getDigit, isNumber, format, parseDecimals, formatNumberString} from '../../../utils/number';
import AddressBookModal from '../AddressBookModal';
import ScanQRAddressModal from '../ScanQRAddressModal';
import {theme} from '../../../theme/dark';
import AuthModal from '../AuthModal';
import {useNavigation} from '@react-navigation/native';
import CustomText from '../../../components/Text';
import { getRecomendedGasPrice } from '../../../services/transaction';
import { KardiaAccount } from 'kardia-js-sdk';

// const MAX_AMOUNT = 5000000000;

const NewKRC20TxModal = ({
  visible,
  onClose,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  tokenAvatar,
}: {
  visible: boolean;
  onClose: () => void;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAvatar: string;
}) => {
  const navigation = useNavigation();
  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('0');
  const [balance, setBalance] = useState('0');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [gasPrice, setGasPrice] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorAddress, setErrorAddress] = useState(' ');
  const [errorAmount, setErrorAmount] = useState(' ');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const language = useRecoilValue(languageAtom);

  const _getKRC20Balance = async () => {
    const balance = await getKRC20Balance(tokenAddress, wallets[selectedWallet].address);
    setBalance(balance)
  }

  useEffect(() => {
    _getKRC20Balance();

    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardWillShow', _keyboardDidShow);
      Keyboard.addListener('keyboardWillHide', _keyboardDidHide);
    } else {
      Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    }

    // cleanup function
    return () => {
      if (Platform.OS === 'ios') {
        Keyboard.removeListener('keyboardWillShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardWillHide', _keyboardDidHide);
      } else {
        Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
      }
    };
  }, []);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false);
  };

  async function send() {
    setShowConfirmModal(false);
    setLoading(true);
    const _wallets = await getWallets();
    const _selectedWallet = await getSelectedWallet();
    const wallet: Wallet = _wallets[_selectedWallet];

    let calculatedGasPrice = await getRecomendedGasPrice();

    if (gasPrice === 1 && calculatedGasPrice) {
      const _calculated = Math.ceil(calculatedGasPrice * 0.75)
      calculatedGasPrice = _calculated >= 10**9 ? _calculated : calculatedGasPrice
    } else if (gasPrice === 3) {
      calculatedGasPrice = Math.ceil(calculatedGasPrice * 1.25)
    }

    const _txAmount = Number(amount.replace(/,/g, ''));
    try {
      const txResult = await transferKRC20(
        tokenAddress,
        wallet.privateKey || '',
        toChecksum(address),
        _txAmount,
        {gasPrice: calculatedGasPrice}
      );
      setLoading(false);
      navigation.navigate('SuccessTx', {
        txHash: txResult,
        type: 'krc20',
        tokenAddress: tokenAddress,
        tokenDecimals: tokenDecimals,
        tokenAvatar: tokenAvatar,
        userAddress: _wallets[_selectedWallet].address,
        tokenSymbol: tokenSymbol,
      });
      resetState();
      onClose();
    } catch (err) {
      console.error(err);
      if (err.message) {
        setError(parseError(err.message, language));
      } else {
        console.error(err);
        setError(getLanguageString(language, 'GENERAL_ERROR'));
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

  const showConfirm = async () => {
    setErrorAddress(' ');
    setErrorAmount(' ');
    let isValid = true;
    if (address === '') {
      setErrorAddress(getLanguageString(language, 'REQUIRED_FIELD'));
      isValid = false;
    }
    if (!KardiaAccount.isAddress(address)) {
      setErrorAddress(getLanguageString(language, 'INVALID_ADDRESS'));
      isValid = false;
    }
    if (amount === '' || amount === '0') {
      setErrorAmount(getLanguageString(language, 'REQUIRED_FIELD'));
      isValid = false;
    }
    const wallet = wallets[selectedWallet];
    const _txAmount = Number(amount.replace(/,/g, ''));
    // const currentBalance = Number(weiToKAI(wallet.balance));
    const currentBalance = await getKRC20Balance(tokenAddress, wallet.address);
    if (_txAmount > Number(parseDecimals(Number(currentBalance), tokenDecimals))) {
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
    setErrorAddress('');
    setErrorAmount('');
  };

  const getModalStyle = () => {
    if (Platform.OS === 'android') {
      return {
        paddingHorizontal: 0,
        // flex: 0.65,
        height: 500,
        backgroundColor: 'rgba(58, 59, 60, 1)',
      };
    } else {
      return {
        paddingHorizontal: 0,
        // flex: 0.65,
        height: 500,
        backgroundColor: 'rgba(58, 59, 60, 1)',
        marginBottom: keyboardOffset - (keyboardShown ? 100 : 0),
        marginTop: -keyboardOffset - (keyboardShown ? 100 : 0),
      };
    }
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

  if (showAuthModal) {
    return (
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={send}
      />
    );
  }

  if (showConfirmModal) {
    return (
      <Modal
        showCloseButton={false}
        visible={showConfirmModal}
        contentStyle={{
          height: 300,
          backgroundColor: theme.backgroundFocusColor,
        }}
        onClose={() => setShowConfirmModal(false)}>
        <CustomText style={[styles.confirmTitle, {color: theme.textColor}]}>
          {getLanguageString(language, 'CONFIRM_TRANSACTION')}
        </CustomText>
        <View style={{width: '100%'}}>
          <View style={styles.confirmGroup}>
            <CustomText style={[styles.confirmText, {color: theme.textColor}]}>
              {getLanguageString(language, 'CREATE_TX_ADDRESS')}:{' '}
            </CustomText>
            <CustomText style={[styles.confirmContent, {color: theme.textColor}]}>
              {truncate(address, 10, 10)}
            </CustomText>
          </View>
          <View style={styles.confirmGroup}>
            <CustomText style={[styles.confirmText, {color: theme.textColor}]}>
              {getLanguageString(language, 'CONFIRM_KAI_AMOUNT')}:{' '}
            </CustomText>
            <CustomText style={[styles.confirmContent, {color: theme.textColor}]}>
              {amount} {tokenSymbol}
            </CustomText>
          </View>
        </View>
        <View
          style={{
            // flexDirection: 'row',
            justifyContent: 'space-evenly',
            width: '100%',
          }}>
          <Button
            title={getLanguageString(language, 'GO_BACK')}
            onPress={() => setShowConfirmModal(false)}
            type="outline"
            style={{marginBottom: 12}}
          />
          <Button
            title={getLanguageString(language, 'CONFIRM')}
            onPress={() => setShowAuthModal(true)}
            type="primary"
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      onClose={() => {
        if (!loading) {
          resetState();
          onClose();
        }
      }}
      showCloseButton={false}
      contentStyle={getModalStyle()}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={[styles.container]}>
          <View>
            <CustomText style={[styles.headline, {color: theme.textColor}]}>
              {getLanguageString(language, 'CREATE_TX_ADDRESS')}
            </CustomText>
          </View>
          <View
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
            <View style={{flex: 3}}>
              <TextInput
                // headlineStyle={{color: 'black'}}
                onChangeText={setAddress}
                message={errorAddress}
                value={address}
                inputStyle={{
                  backgroundColor: 'rgba(96, 99, 108, 1)',
                  color: theme.textColor,
                  paddingRight: 60
                }}
                // headline={getLanguageString(language, 'CREATE_TX_ADDRESS')}
                icons={() => {
                  return (
                    <TouchableOpacity
                      style={{position: 'absolute', right: 10}}
                      onPress={async () => setAddress(await getFromClipboard())}
                    >
                      <CustomText
                        style={{
                          color: theme.urlColor,
                          fontWeight: '500',
                          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                        }}
                      >
                        Paste
                      </CustomText>
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
            <TouchableOpacity
              onPress={showQRScanner}
              style={{
                // flex: 1,
                padding: 15,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                height: 44,
                width: 44,
                borderWidth: 1.5,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 8,
              }}>
              <Image
                source={require('../../../assets/icon/scan_qr_dark.png')}
                style={{width: 18, height: 18}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={showAddressBookSelector}
              style={{
                // flex: 1,
                padding: 15,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                height: 44,
                width: 44,
                borderWidth: 1.5,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../../../assets/icon/address_book_dark.png')}
                style={{width: 18, height: 18}}
              />
            </TouchableOpacity>
          </View>

          <View style={{marginBottom: 10}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <CustomText style={{color: theme.textColor, marginBottom: 5, fontWeight: 'bold'}}>{getLanguageString(language, 'CREATE_TX_KRC20_AMOUNT')}</CustomText>
              <TouchableOpacity onPress={() => setAmount(formatNumberString(parseDecimals(balance, tokenDecimals)))}>
                <CustomText style={{color: theme.urlColor}}>
                  {formatNumberString(parseDecimals(balance, tokenDecimals))} {tokenSymbol}
                </CustomText>
              </TouchableOpacity>
            </View>
            <TextInput
              // headlineStyle={{color: 'black'}}
              keyboardType="numeric"
              message={errorAmount}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
                paddingRight: 60
              }}
              onChangeText={(newAmount) => {
                const digitOnly = getDigit(newAmount);
                if (digitOnly === '') {
                  setAmount('0');
                  return;
                }
                if (isNumber(digitOnly)) {
                  let formatedValue = formatNumberString(digitOnly);

                  const [numParts, decimalParts] = digitOnly.split('.')
                  if (!decimalParts && decimalParts !== "") {
                    setAmount(formatedValue);
                    return
                  }

                  formatedValue = formatNumberString(numParts) + '.' + decimalParts

                  setAmount(formatedValue);
                }
                // isNumber(digitOnly) && setAmount(digitOnly);
              }}
              onBlur={() => setAmount(format(Number(getDigit(amount))))}
              value={amount}
              // headline={getLanguageString(language, 'CREATE_TX_KRC20_AMOUNT')}
              icons={() => {
                return (
                  <TouchableOpacity 
                    style={{position: 'absolute', right: 10}}
                    onPress={() => setAmount(formatNumberString(parseDecimals(balance, tokenDecimals)))}
                  >
                    <CustomText 
                      style={{
                        color: theme.urlColor,
                        fontWeight: '500',
                        fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                      }}
                    >
                      MAX
                    </CustomText>
                  </TouchableOpacity>
                )
              }}
            />
          </View>

          <CustomText
            allowFontScaling={false}
            style={[styles.title, {marginBottom: 12, color: theme.textColor}]}>
            {getLanguageString(language, 'TRANSACTION_SPEED')}
          </CustomText>
          <View style={{marginBottom: 20}}>
            <ListCard gasPrice={gasPrice} selectGasPrice={setGasPrice} />
          </View>

          <View
            style={{
              // flexDirection: 'row',
              marginTop: 20,
              justifyContent: 'center',
            }}>
            <Button
              title={getLanguageString(language, 'CANCEL')}
              onPress={() => {
                resetState();
                onClose();
              }}
              block
              type="outline"
              style={{marginBottom: 12}}
              textStyle={{fontSize: theme.defaultFontSize + 3}}
              // size="large"
              disabled={loading}
            />
            <Button
              title={getLanguageString(language, 'SEND_NOW')}
              onPress={showConfirm}
              // iconName="paper-plane"
              block
              type="primary"
              // size="large"
              loading={loading}
              disabled={loading}
              textStyle={{
                fontWeight: '500',
                fontSize: theme.defaultFontSize + 3,
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
              }}
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

export default NewKRC20TxModal;
