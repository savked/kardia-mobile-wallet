/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Dimensions, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useRecoilValue} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import {copyToClipboard} from '../../utils/string';

const {width: viewportWidth} = Dimensions.get('window');

const QRModal = ({onClose}: {onClose: () => void}) => {
  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);

  return (
    <Modal
      visible={true}
      showCloseButton={false}
      contentStyle={{
        paddingHorizontal: 24,
      }}
      onClose={onClose}>
      <Text>Scan below QR code for address</Text>
      <View style={{paddingVertical: 14}}>
        <QRCode
          size={viewportWidth / 1.5}
          value={wallets[selectedWallet].address}
          logo={require('../../assets/logo.png')}
          logoBackgroundColor="#FFFFFF"
          logoSize={22}
          logoMargin={2}
          logoBorderRadius={20}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          width: '100%',
        }}>
        <Button
          size="large"
          title="Copy address"
          type="secondary"
          onPress={() => copyToClipboard(wallets[selectedWallet].address)}
          iconName="copy"
        />
        <Button size="large" title="Close" type="primary" onPress={onClose} />
      </View>
    </Modal>
  );
};

export default QRModal;
