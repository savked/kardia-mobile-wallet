/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Dimensions, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import Modal from '../../components/Modal';
import {getLanguageString} from '../../utils/lang';

const {width: viewportWidth} = Dimensions.get('window');

const QRModal = ({
  onClose,
  visible,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const language = useRecoilValue(languageAtom);

  return (
    <Modal
      visible={visible}
      showCloseButton={true}
      contentStyle={{
        paddingHorizontal: 0,
      }}
      onClose={onClose}>
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        {getLanguageString(language, 'SCAN_QR_FOR_ADDRESS')}
      </Text>
      <View style={{paddingVertical: 14}}>
        <QRCode
          size={viewportWidth / 1.7}
          value={wallets[selectedWallet] ? wallets[selectedWallet].address : ''}
          logo={require('../../assets/logo.png')}
          logoBackgroundColor="#FFFFFF"
          logoSize={22}
          logoMargin={2}
          logoBorderRadius={20}
        />
      </View>
    </Modal>
  );
};

export default QRModal;
