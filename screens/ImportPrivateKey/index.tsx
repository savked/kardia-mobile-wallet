import React, {useContext, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import * as Sentry from '@sentry/react-native';
import TextInput from '../../components/TextInput';
import Modal from '../../components/Modal';
import {styles} from './style';
import {truncate} from '../../utils/string';
import Button from '../../components/Button';
import {useNavigation} from '@react-navigation/native';
import {getWalletFromPK} from '../../utils/blockchain';
import {useRecoilState} from 'recoil';
import {walletsAtom} from '../../atoms/wallets';
import {saveWallets} from '../../utils/local';
import {ThemeContext} from '../../App';
import {getBalance} from '../../services/account';

const ImportPrivateKey = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const [privateKey, setPrivateKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [wallets, setWallets] = useRecoilState(walletsAtom);

  const onSuccess = (e: any) => {
    setShowModal(false);
    if (e.data === '') {
      Alert.alert('Invalid QR code');
      return;
    }
    setPrivateKey(e.data);
  };

  const importPK = async () => {
    try {
      const wallet = getWalletFromPK(privateKey);
      const balance = await getBalance(wallet.getAddressString());
      const walletObj: Wallet = {
        address: wallet.getChecksumAddressString(),
        privateKey: wallet.getPrivateKeyString(),
        balance,
      };

      const newWallets = JSON.parse(JSON.stringify(wallets));
      newWallets.push(walletObj);

      setWallets(newWallets);
      saveWallets(newWallets);
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Text style={[styles.title, {color: theme.textColor}]}>
        Enter your Private key
      </Text>
      <TextInput
        value={truncate(privateKey, 10, 20)}
        onChangeText={setPrivateKey}
        iconName="qrcode"
        onIconPress={() => setShowModal(true)}
      />
      {showModal && (
        <Modal
          showCloseButton={false}
          visible={true}
          onClose={() => setShowModal(false)}>
          <Text>Scan QR Code for Private key</Text>
          <QRCodeScanner onRead={onSuccess} />
        </Modal>
      )}
      <View style={styles.buttonGroup}>
        <Button size="large" type="primary" onPress={importPK} title="Import" />
        <Button
          size="large"
          type="secondary"
          onPress={() => navigation.goBack()}
          title="Cancel"
        />
      </View>
    </View>
  );
};

export default ImportPrivateKey;
