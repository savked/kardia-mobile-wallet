/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import {selectedWalletAtom, walletsAtom} from '../../../atoms/wallets';
import Modal from '../../../components/Modal';
import {ThemeContext} from '../../../ThemeContext';
import {getLanguageString} from '../../../utils/lang';
import {copyToClipboard} from '../../../utils/string';

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

  const theme = useContext(ThemeContext);

  return (
    <Modal
      visible={visible}
      showCloseButton={true}
      contentStyle={{
        paddingHorizontal: 0,
        flex: 0.5,
      }}
      onClose={onClose}>
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        {getLanguageString(language, 'SCAN_QR_FOR_ADDRESS')}
      </Text>
      <TouchableOpacity
        onPress={() =>
          copyToClipboard(
            wallets[selectedWallet] ? wallets[selectedWallet].address : '',
          )
        }>
        <Text
          style={{
            fontSize: 16,
            fontStyle: 'italic',
            paddingHorizontal: 24,
            textAlign: 'center',
            textDecorationLine: 'underline',
          }}>
          {wallets[selectedWallet] ? wallets[selectedWallet].address : ''}
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          fontStyle: 'italic',
          fontWeight: 'bold',
          paddingHorizontal: 12,
          paddingVertical: 16,
          color: theme.primaryColor,
        }}>
        {getLanguageString(language, 'ERC20_WARNING')}
      </Text>
      <View style={{paddingVertical: 14}}>
        <QRCode
          size={viewportWidth / 1.8}
          value={wallets[selectedWallet] ? wallets[selectedWallet].address : ''}
          logo={require('../../../assets/logo.png')}
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
