/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {View, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './style';
import HomeHeader from './Header';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {getWalletFromPK} from '../../utils/blockchain';
import {saveWallets} from '../../utils/local';
import AlertModal from '../../components/AlertModal';
import {ThemeContext} from '../../App';
import {getBalance} from '../../services/account';
import ImportModal from './ImportModal';
import QRModal from './QRModal';
import TxListSection from './TxListSection';
import CardSliderSection from './CardSliderSection';

const HomeScreen = () => {
  const setSelectedWallet = useSetRecoilState(selectedWalletAtom);
  const [showQRModal, setShowQRModal] = useState(false);
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showScanAlert, setShowScanAlert] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanType, setScanType] = useState('warning');

  const theme = useContext(ThemeContext);

  const onSuccessScan = (e: any) => {
    setShowImportModal(false);
    if (e.data === '') {
      Alert.alert('Invalid QR code');
      return;
    }
    importPK(e.data);
  };

  const importPK = async (privateKey: string) => {
    try {
      const wallet = getWalletFromPK(privateKey);
      const balance = await getBalance(wallet.getAddressString());
      const walletObj: Wallet = {
        address: wallet.getChecksumAddressString(),
        privateKey: wallet.getPrivateKeyString(),
        balance,
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
    } catch (error) {
      console.error(error);
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
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
