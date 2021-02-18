/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Alert, Text, Dimensions, InteractionManager} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './style';
import HomeHeader from './Header';
import * as Bip39 from 'bip39';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {
  getAppPasscodeSetting,
  getSelectedWallet,
  getWallets,
  saveMnemonic,
  saveSelectedWallet,
  saveWallets,
} from '../../utils/local';
import AlertModal from '../../components/AlertModal';
import {ThemeContext} from '../../ThemeContext';
import {getBalance} from '../../services/account';
import ImportModal from './ImportModal';
import QRModal from './QRModal';
import TxListSection from './TxListSection';
import CardSliderSection from './CardSliderSection';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import {languageAtom} from '../../atoms/language';
import {getLanguageString} from '../../utils/lang';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {getWalletFromPK} from '../../utils/blockchain';
import RemindPasscodeModal from '../common/RemindPasscodeModal';
import {getStakingAmount} from '../../services/staking';
import SelectWallet from './SelectWallet';

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
  const [selectingWallet, setSelectingWallet] = useState(false);

  const setWallets = useSetRecoilState(walletsAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );

  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      // Get local auth setting
      const enabled = await getAppPasscodeSetting();
      if (!enabled) {
        setShowPasscodeRemindModal(true);
      }
    })();
  }, []);

  const updateWalletBalance = async (newSelectedWallet?: number) => {
    const _wallets = await getWallets();
    const _selectedWallet =
      newSelectedWallet !== undefined
        ? newSelectedWallet
        : await getSelectedWallet();
    if (!_wallets[_selectedWallet]) {
      return;
    }
    try {
      const balance = await getBalance(_wallets[_selectedWallet].address);
      const staked = await getStakingAmount(_wallets[_selectedWallet].address);
      const newWallets: Wallet[] = JSON.parse(JSON.stringify(_wallets));
      newWallets.forEach((walletItem, index) => {
        walletItem.address === _wallets[_selectedWallet].address;
        newWallets[index].balance = balance;
        newWallets[index].staked = staked;
      });
      setWallets(newWallets);
      _selectedWallet !== selectedWallet && setSelectedWallet(_selectedWallet);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      updateWalletBalance();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    updateWalletBalance(selectedWallet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  useEffect(() => {
    if (mnemonic.trim() !== '') {
      const valid = Bip39.validateMnemonic(mnemonic.trim());
      if (!valid) {
        setProcessing(false);
        setScanMessage(getLanguageString(language, 'ERROR_SEED_PHRASE'));
        setScanType('warning');
        setShowScanAlert(true);
        return;
      }
      setSelectingWallet(true);
    }
  }, [mnemonic, language]);

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

  const saveWallet = async (_wallet: Wallet) => {
    const localWallets = await getWallets();
    const _privateKey = _wallet.privateKey;
    const walletAddress = _wallet.address;
    const balance = await getBalance(walletAddress);
    const staked = await getStakingAmount(walletAddress);

    const wallet: Wallet = {
      privateKey: _privateKey,
      address: walletAddress,
      balance,
      staked,
    };

    const walletExisted = localWallets
      .map((item) => item.address)
      .includes(wallet.address);

    if (walletExisted) {
      setProcessing(false);
      setScanMessage(getLanguageString(language, 'WALLET_EXISTED'));
      setScanType('warning');
      setShowScanAlert(true);
      return;
    }

    await saveMnemonic(
      walletAddress,
      mnemonic !== '' ? mnemonic.trim() : 'FROM_PK',
    );
    const _wallets = JSON.parse(JSON.stringify(localWallets));
    _wallets.push(wallet);
    await saveWallets(_wallets);
    await saveSelectedWallet(_wallets.length - 1);
    setWallets(_wallets);
    setProcessing(false);
    setSelectedWallet(_wallets.length - 1);
    setMnemonic('');
    setSelectingWallet(false);
    // RNRestart.Restart();
  };

  const importPrivateKey = async (_privateKey: string) => {
    if (!_privateKey.includes('0x')) {
      _privateKey = '0x' + _privateKey;
    }
    try {
      const _wallet = getWalletFromPK(_privateKey.trim());
      const walletAddress = _wallet.getChecksumAddressString();
      const balance = await getBalance(walletAddress);
      const staked = await getStakingAmount(walletAddress);
      const wallet: Wallet = {
        privateKey: _privateKey.trim(),
        address: walletAddress,
        balance,
        staked,
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
      setWallets((_) => {
        return _wallets;
      });
      setProcessing(false);
      setSelectedWallet(_wallets.length - 1);
      setPrivateKey('');
      // RNRestart.Restart();
    } catch (error) {
      setProcessing(false);
      console.error(error);
      setScanMessage(getLanguageString(language, 'ERROR_PRIVATE_KEY'));
      setScanType('warning');
      setShowScanAlert(true);
    }
  };

  if (selectingWallet) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
        <SelectWallet
          mnemonic={mnemonic}
          onSelect={saveWallet}
          onCancel={() => {
            setMnemonic('');
            setSelectingWallet(false);
          }}
          onError={(err) => {
            let message = getLanguageString(language, 'GENERAL_ERROR');
            if (err.message) {
              message = err.message;
            }
            setScanMessage(message);
            setScanType('warning');
            setShowScanAlert(true);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
      <HomeHeader />
      <QRModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccessScan={onSuccessScan}
        />
      )}
      <View style={[styles.bodyContainer]}>
        <CardSliderSection
          importWallet={() => setShowImportModal(true)}
          showQRModal={() => setShowQRModal(true)}
        />
        <TxListSection />
        <AlertModal
          type={scanType as any}
          visible={showScanAlert}
          onClose={() => {
            setShowScanAlert(false);
            setMnemonic('');
            setPrivateKey('');
          }}
          message={scanMessage}
        />
        <Modal
          showCloseButton={false}
          visible={privateKey !== '' && !showScanAlert}
          contentStyle={{
            flex: 0.3,
            marginTop: viewportHeight / 3,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
            marginHorizontal: 14,
          }}
          onClose={() => setPrivateKey('')}>
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
                disabled={processing}
                title={getLanguageString(language, 'SUBMIT')}
                onPress={() => {
                  setProcessing(true);
                  InteractionManager.runAfterInteractions(async () => {
                    importPrivateKey(privateKey);
                  });
                }}
              />
            </View>
          </View>
        </Modal>
        <RemindPasscodeModal
          visible={showPasscodeRemindModal}
          onClose={() => setShowPasscodeRemindModal(false)}
          enablePasscode={() => {
            setShowPasscodeRemindModal(false);
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Setting',
                  state: {
                    routes: [{name: 'Setting'}, {name: 'SettingPasscode'}],
                  },
                },
              ],
            });
            // navigation.navigate('Setting', {screen: 'SettingPasscode'});
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
