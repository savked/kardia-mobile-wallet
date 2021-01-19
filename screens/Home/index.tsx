/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {View, Alert, Text, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './style';
import HomeHeader from './Header';
import * as Bip39 from 'bip39';
import {ethers} from 'ethers';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {saveMnemonic, saveSelectedWallet, saveWallets} from '../../utils/local';
import AlertModal from '../../components/AlertModal';
import {ThemeContext} from '../../App';
import {getBalance} from '../../services/account';
import ImportModal from './ImportModal';
import QRModal from './QRModal';
import TxListSection from './TxListSection';
import CardSliderSection from './CardSliderSection';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import {languageAtom} from '../../atoms/language';
import {getLanguageString} from '../../utils/lang';
import {useNavigation} from '@react-navigation/native';
import {getWalletFromPK} from '../../utils/blockchain';

const {height: viewportHeight} = Dimensions.get('window');

const HomeScreen = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const wallets = useRecoilValue(walletsAtom);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScanAlert, setShowScanAlert] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanType, setScanType] = useState('warning');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPasscodeRemindModal, setShowPasscodeRemindModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const setWallets = useSetRecoilState(walletsAtom);
  const setSelectedWallet = useSetRecoilState(selectedWalletAtom);

  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const navigation = useNavigation();

  const onSuccessScan = (e: any, type: string) => {
    setShowImportModal(false);
    if (e.data === '') {
      Alert.alert('Invalid QR code');
      return;
    }
    if (type === 'mnemonic') {
      setPrivateKey('');
      setMnemonic(e.data);
    } else {
      setPrivateKey(e.data);
      setMnemonic('');
    }
  };

  const importMnemonic = async (_mnemonic: string) => {
    try {
      const valid = Bip39.validateMnemonic(_mnemonic);
      if (!valid) {
        setProcessing(false);
        return;
      }
      const _wallet = ethers.Wallet.fromMnemonic(_mnemonic.trim());
      const _privateKey = _wallet.privateKey;
      const walletAddress = _wallet.address;
      const balance = await getBalance(walletAddress);
      const wallet: Wallet = {
        privateKey: _privateKey,
        address: walletAddress,
        balance,
      };

      const walletExisted = wallets
        .map((item) => item.address)
        .includes(wallet.address);

      if (walletExisted) {
        setProcessing(false);
        setScanMessage(getLanguageString(language, 'WALLET_EXISTED'));
        setScanType('warning');
        setShowScanAlert(true);
        return;
      }

      await saveMnemonic(walletAddress, _mnemonic.trim());
      const _wallets = JSON.parse(JSON.stringify(wallets));
      _wallets.push(wallet);
      await saveWallets(_wallets);
      await saveSelectedWallet(_wallets.length - 1);
      setWallets(_wallets);
      setSelectedWallet(_wallets.length - 1);
      setMnemonic('');
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      console.error(error);
    }
  };

  const importPrivateKey = async (_privateKey: string) => {
    try {
      const _wallet = getWalletFromPK(_privateKey);
      const walletAddress = _wallet.getChecksumAddressString();
      const balance = await getBalance(walletAddress);
      const wallet: Wallet = {
        privateKey: _privateKey,
        address: walletAddress,
        balance,
      };

      const walletExisted = wallets
        .map((item) => item.address)
        .includes(wallet.address);

      if (walletExisted) {
        setProcessing(false);
        setScanMessage(getLanguageString(language, 'WALLET_EXISTED'));
        setScanType('warning');
        setShowScanAlert(true);
        return;
      }
      await saveMnemonic(walletAddress, 'FROM_PK');
      const _wallets = JSON.parse(JSON.stringify(wallets));
      _wallets.push(wallet);
      await saveWallets(_wallets);
      await saveSelectedWallet(_wallets.length - 1);
      setWallets(_wallets);
      setSelectedWallet(_wallets.length - 1);
      setPrivateKey('');
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
      <HomeHeader />
      {showQRModal && <QRModal onClose={() => setShowQRModal(false)} />}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccessScan={onSuccessScan}
          importMnemonic={importMnemonic}
          importPrivateKey={importPrivateKey}
        />
      )}
      <View style={[styles.bodyContainer]}>
        <CardSliderSection
          importWallet={() => setShowImportModal(true)}
          showQRModal={() => setShowQRModal(true)}
        />
        <TxListSection />
        {showScanAlert && (
          <AlertModal
            type={scanType as any}
            visible={showScanAlert}
            onClose={() => setShowScanAlert(false)}
            message={scanMessage}
          />
        )}
        {mnemonic !== '' && (
          <Modal
            showCloseButton={false}
            visible={true}
            // contentStyle={{marginTop: viewportHeight / 1.4}}
            contentStyle={{
              flex: 0.3,
              marginTop: viewportHeight / 3,
              borderBottomRightRadius: 20,
              borderBottomLeftRadius: 20,
              marginHorizontal: 14,
            }}
            onClose={() => setMnemonic('')}>
            <View style={{justifyContent: 'space-between', flex: 1}}>
              <Text style={{textAlign: 'center'}}>
                {getLanguageString(language, 'ARE_YOU_SURE')}
              </Text>
              <Text>
                {getLanguageString(language, 'RESTART_APP_DESCRIPTION')}
              </Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <Button
                  title={getLanguageString(language, 'GO_BACK')}
                  type="secondary"
                  onPress={() => setMnemonic('')}
                />
                <Button
                  loading={processing}
                  title={getLanguageString(language, 'SUBMIT')}
                  onPress={() => {
                    setProcessing(true);
                    setTimeout(() => {
                      importMnemonic(mnemonic);
                    }, 100);
                  }}
                />
              </View>
            </View>
          </Modal>
        )}
        {privateKey !== '' && (
          <Modal
            showCloseButton={false}
            visible={true}
            contentStyle={{
              flex: 0.3,
              marginTop: viewportHeight / 3,
              borderBottomRightRadius: 20,
              borderBottomLeftRadius: 20,
              marginHorizontal: 14,
            }}
            onClose={() => setPrivateKey('')}>
            <View>
              <Text style={{textAlign: 'center'}}>
                {getLanguageString(language, 'ARE_YOU_SURE')}
              </Text>
              <Text>
                {getLanguageString(language, 'RESTART_APP_DESCRIPTION')}
              </Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <Button
                  title={getLanguageString(language, 'GO_BACK')}
                  type="secondary"
                  onPress={() => setMnemonic('')}
                />
                <Button
                  loading={processing}
                  title={getLanguageString(language, 'SUBMIT')}
                  onPress={() => {
                    setProcessing(true);
                    setTimeout(() => {
                      importPrivateKey(privateKey);
                    }, 100);
                  }}
                />
              </View>
            </View>
          </Modal>
        )}
        {showPasscodeRemindModal && (
          <Modal
            showCloseButton={false}
            contentStyle={{
              flex: 0.3,
              marginTop: viewportHeight / 3,
              borderBottomRightRadius: 20,
              borderBottomLeftRadius: 20,
              marginHorizontal: 14,
            }}
            visible={true}
            onClose={() => setShowPasscodeRemindModal(false)}>
            <Text>{getLanguageString(language, 'NO_PASSCODE')}</Text>
            <Text>{getLanguageString(language, 'PASSCODE_DESCRIPTION')}</Text>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-evenly',
              }}>
              <Button
                type="ghost"
                title={getLanguageString(language, 'LATER')}
                onPress={() => setShowPasscodeRemindModal(false)}
              />
              <Button
                type="primary"
                title={getLanguageString(language, 'SET_APP_PASSCODE')}
                onPress={() => {
                  setShowPasscodeRemindModal(false);
                  navigation.navigate('Setting', {screen: 'SettingPasscode'});
                }}
              />
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
