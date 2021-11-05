/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import { KardiaAccount } from 'kardia-js-sdk';
import React, { useEffect, useState } from 'react';
import {
    Alert, Image, Keyboard,
    Platform,
    TouchableOpacity, TouchableWithoutFeedback,
    View
} from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import { pendingTxSelector } from '../../../atoms/pendingTx';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import AlertModal from '../../../components/AlertModal';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import TextInput from '../../../components/TextInput';
import { getBalance } from '../../../services/account';
import { createTx, getRecomendedGasPrice } from '../../../services/transaction';
import { weiToKAI } from '../../../services/transaction/amount';
import { theme } from '../../../theme/dark';
import { getLanguageString, parseError } from '../../../utils/lang';
import { saveWallets } from '../../../utils/local';
// import Icon from 'react-native-vector-icons/FontAwesome';
import { format, formatNumberString, getDigit, isNumber, parseDecimals, parseKaiBalance } from '../../../utils/number';
import { getFromClipboard, toChecksum, truncate } from '../../../utils/string';
import AddressBookModal from '../AddressBookModal';
import AuthModal from '../AuthModal';
import ScanQRAddressModal from '../ScanQRAddressModal';
import ListCard from './ListCard';
import { styles } from './style';

const MAX_AMOUNT = 5000000000;

const NewTxModal = ({
  visible,
  onClose,
  beforeShowSuccess
}: {
  visible: boolean;
  onClose: (showSuccess?: boolean) => void;
  beforeShowSuccess?: () => void
}) => {
  const navigation = useNavigation();
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('0');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [gasPrice, setGasPrice] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorAddress, setErrorAddress] = useState('');
  const [errorAmount, setErrorAmount] = useState('');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallets[selectedWallet].address))

  const language = useRecoilValue(languageAtom);

  useEffect(() => {
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

  const calculateGasPrice = async () => {
    let calculatedGasPrice = await getRecomendedGasPrice();
    if (gasPrice === 1 && calculatedGasPrice) {
      const _calculated = Math.ceil(calculatedGasPrice * 0.75)
      calculatedGasPrice = _calculated >= 10**9 ? _calculated : calculatedGasPrice
    } else if (gasPrice === 3) {
      calculatedGasPrice = Math.ceil(calculatedGasPrice * 1.25)
    }

    return calculatedGasPrice
  }

  async function send() {
    setShowConfirmModal(false);
    setLoading(true);
    const wallet = wallets[selectedWallet];
    const _txAmount = Number(amount.replace(/,/g, ''));

    const calculatedGasPrice = await calculateGasPrice()

    try {
      const txHash = await createTx(
        wallet,
        toChecksum(address.trim()),
        _txAmount,
        calculatedGasPrice,
      );
      const newBallance = await getBalance(wallet.address);
      const newWallets: Wallet[] = JSON.parse(JSON.stringify(wallets));

      newWallets[selectedWallet].balance = newBallance;
      await saveWallets(newWallets)
      setWallets(newWallets);

      setLoading(false);
      beforeShowSuccess && beforeShowSuccess()
      if (wallet.address) {
        setPendingTx(txHash)
      }
      navigation.navigate('SuccessTx', {txHash: txHash});
      resetState();
      onClose(true);
      // setSuccessHash(txHash);
    } catch (err) {
      console.log(err);
      if (err.message) {
        setError(parseError(err.message, language));
      } else {
        console.log(err);
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
    const wallet = wallets[selectedWallet];
    if (pendingTx && wallet.address) {
      Alert.alert(getLanguageString(language, 'HAS_PENDING_TX'));
      return;
    }
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
    
    const _txAmount = Number(amount.replace(/,/g, ''));
    const currentBalance = Number(weiToKAI(wallet.balance));
    if (_txAmount > currentBalance) {
      setErrorAmount(getLanguageString(language, 'NOT_ENOUGH_KAI_FOR_TX'));
      isValid = false;
    }
    if (!isValid) {
      return;
    }

    // const calculatedGasPrice = await calculateGasPrice()
    // setGasPriceAuth((new BigNumber(calculatedGasPrice)).dividedBy(new BigNumber(10 ** 9)).toFixed())
    // setAmountAuth(amount)

    setShowConfirmModal(true);
    // setShowAuthModal(true);
  };

  const resetState = () => {
    setAddress('');
    setAmount('0');
    setErrorAddress('');
    setErrorAmount('');
  };

  const _getBalance = () => {
    if (!wallets[selectedWallet]) return '0';
    return wallets[selectedWallet].balance;
  }

  const getMaxBalance = () => {
    const currentBalance = _getBalance();
    if (currentBalance === '0') return currentBalance

    const bnBalance = new BigNumber(currentBalance);
    if (bnBalance.isGreaterThan(10**18)) {
      return bnBalance.minus(10**16).toFixed()
    }

    const tenPercent = bnBalance.multipliedBy(0.1);
    return bnBalance.minus(tenPercent).toFixed()
  }

  const getModalStyle = () => {
    if (Platform.OS === 'android') {
      return {
        paddingHorizontal: 0,
        // flex: 0.65,
        height: keyboardShown ? 500 : 560,
        backgroundColor: 'rgba(58, 59, 60, 1)',
      };
    } else {
      return {
        paddingHorizontal: 0,
        // flex: 0.65,
        height: keyboardShown ? 500 : 560,
        backgroundColor: 'rgba(58, 59, 60, 1)',
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
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
        // gasPrice={gasPriceAuth}
        // gasLimit={DEFAULT_KAI_TX_GAS_LIMIT.toString()}
        // amount={amountAuth}
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
          justifyContent: 'flex-start',
          backgroundColor: theme.backgroundFocusColor,
        }}
        onClose={() => setShowConfirmModal(false)}>
        <CustomText style={[styles.confirmTitle, {color: theme.textColor}]}>
          {getLanguageString(language, 'CONFIRM_TRANSACTION')}
        </CustomText>
        <View style={{width: '100%', marginBottom: 24}}>
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
              {amount} KAI
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
            textStyle={{fontWeight: '500', fontSize: theme.defaultFontSize + 3, fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}
          />
          <Button
            title={getLanguageString(language, 'CONFIRM')}
            onPress={() => setShowAuthModal(true)}
            type="primary"
            textStyle={{fontWeight: '500', fontSize: theme.defaultFontSize + 3, fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}
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
            <CustomText style={[styles.headline, {color: theme.textColor, fontSize: theme.defaultFontSize + 1}]}>
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
                onChangeText={setAddress}
                message={errorAddress}
                value={address}
                inputStyle={{
                  backgroundColor: 'rgba(96, 99, 108, 1)',
                  color: theme.textColor,
                  paddingRight: 60
                }}
                placeholder={getLanguageString(language, 'CREATE_TX_ADDRESS_PLACEHOLDER')}
                placeholderTextColor={theme.mutedTextColor}
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
              <CustomText style={{color: theme.textColor, marginBottom: 5, fontWeight: '500', fontSize: theme.defaultFontSize + 1}}>{getLanguageString(language, 'CREATE_TX_KAI_AMOUNT')}</CustomText>
              <TouchableOpacity onPress={() => setAmount(formatNumberString(parseDecimals(getMaxBalance(), 18)))}>
                <CustomText style={{color: theme.urlColor}}>
                  {parseKaiBalance(_getBalance())} KAI
                </CustomText>
              </TouchableOpacity>
            </View>
            <TextInput
              // headlineStyle={{color: 'black'}}
              keyboardType={Platform.OS === 'android' ? "decimal-pad" : "numbers-and-punctuation"}
              message={errorAmount}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
                paddingRight: 60
              }}
              onChangeText={(newAmount) => {
                const digitOnly = getDigit(newAmount);
                if (Number(digitOnly) > MAX_AMOUNT) {
                  return;
                }
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
              }}
              onBlur={() => setAmount(format(Number(getDigit(amount))))}
              value={amount}
              icons={() => {
                return (
                  <TouchableOpacity 
                    style={{position: 'absolute', right: 10}}
                    onPress={() => setAmount(formatNumberString(parseDecimals(getMaxBalance(), 18)))}
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
            style={[styles.title, {marginBottom: 12, color: theme.textColor, fontSize: theme.defaultFontSize + 1}]}>
            {getLanguageString(language, 'TRANSACTION_SPEED')}
          </CustomText>
          <View style={{marginBottom: 20}}>
            <ListCard gasPrice={gasPrice} selectGasPrice={setGasPrice} />
          </View>
          <CustomText
            style={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
              color: theme.warningTextColor,
              fontStyle: 'italic'
            }}
          >
            {getLanguageString(language, 'CROSSCHAIN_WARNING')}
          </CustomText>
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
              textStyle={{fontWeight: '500', fontSize: theme.defaultFontSize + 4, fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}
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
              textStyle={{
                fontWeight: '500', fontSize: theme.defaultFontSize + 3,
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
              }}
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
