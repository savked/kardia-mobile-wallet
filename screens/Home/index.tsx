/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {View, Alert, Text, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './style';
import HomeHeader from './Header';
import * as Bip39 from 'bip39';
import {hdkey} from 'ethereumjs-wallet';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import * as Sentry from '@sentry/react-native';
// import RNRestart from 'react-native-restart';
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

const {height: viewportHeight} = Dimensions.get('window');

const HomeScreen = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const wallets = useRecoilValue(walletsAtom);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScanAlert, setShowScanAlert] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanType, setScanType] = useState('warning');
  const [mnemonic, setMnemonic] = useState('');

  const setWallets = useSetRecoilState(walletsAtom);
  const setSelectedWallet = useSetRecoilState(selectedWalletAtom);

  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const onSuccessScan = (e: any) => {
    setShowImportModal(false);
    if (e.data === '') {
      Alert.alert('Invalid QR code');
      return;
    }
    setMnemonic(e.data);
  };

  const importMnemonic = async () => {
    try {
      const valid = Bip39.validateMnemonic(mnemonic);
      if (!valid) {
        return;
      }
      const seed = await Bip39.mnemonicToSeed(mnemonic.trim());
      const root = hdkey.fromMasterSeed(seed);
      const masterWallet = root.getWallet();
      const privateKey = masterWallet.getPrivateKeyString();
      const walletAddress = masterWallet.getChecksumAddressString();
      const balance = await getBalance(walletAddress);
      const wallet: Wallet = {
        privateKey: privateKey,
        address: walletAddress,
        balance,
      };

      const walletExisted = wallets
        .map((item) => item.address)
        .includes(wallet.address);

      if (walletExisted) {
        setScanMessage('Wallet already imported');
        setScanType('warning');
        setShowScanAlert(true);
        return;
      }

      await saveMnemonic(walletAddress, mnemonic.trim());
      const _wallets = JSON.parse(JSON.stringify(wallets));
      _wallets.push(wallet);
      await saveWallets(_wallets);
      await saveSelectedWallet(_wallets.length - 1);
      setWallets(_wallets);
      setSelectedWallet(_wallets.length - 1);
      setMnemonic('');
      // RNRestart.Restart();
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
  };

  if (showImportModal) {
    return (
      <ImportModal
        onClose={() => setShowImportModal(false)}
        onSuccessScan={onSuccessScan}
      />
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
      <HomeHeader />
      <View style={[styles.bodyContainer]}>
        <CardSliderSection
          importWallet={() => setShowImportModal(true)}
          showQRModal={() => setShowQRModal(true)}
        />
        <TxListSection />
        {showQRModal && <QRModal onClose={() => setShowQRModal(false)} />}
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
            contentStyle={{flex: 0.3, marginTop: viewportHeight / 3}}
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
                  title={getLanguageString(language, 'SUBMIT')}
                  onPress={importMnemonic}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
