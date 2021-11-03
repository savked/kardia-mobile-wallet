import React, { useContext, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { copyToClipboard } from '../../utils/string';
import QRModal from '../common/AddressQRCode';
import NewKRC20TxModal from '../common/NewKRC20TxModal';
import { styles } from './style';

export default ({
  tokenAvatar,
  tokenAddress,
  tokenSymbol,
  tokenDecimals
}: {
  tokenAvatar: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [showNewTxModal, setShowNewTxModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false);
  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  return (
    <View style={{width: 180, flexDirection: 'row', paddingVertical: 20, justifyContent: 'space-between'}}>
      {
        showNewTxModal && (
          <NewKRC20TxModal
            visible={showNewTxModal}
            tokenAvatar={tokenAvatar}
            onClose={() => {
              setShowNewTxModal(false);
            }}
            tokenAddress={tokenAddress}
            tokenSymbol={tokenSymbol}
            tokenDecimals={tokenDecimals}
          />
        )
      }
      <QRModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
      <View style={{alignItems: 'center', justifyContent: 'center', width: '33%'}}>
        <TouchableOpacity
          style={[styles.controlButton, {backgroundColor: theme.secondaryColor}]}
          onPress={() => setShowNewTxModal(true)}
        >
          <Image
            source={require('../../assets/icon/send_button.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
          
        </TouchableOpacity>
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {getLanguageString(language, 'SEND')}
        </CustomText>
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center', width: '33%'}}>
        <TouchableOpacity
          style={[styles.controlButton, {backgroundColor: theme.secondaryColor}]}
          onPress={() => setShowQRModal(true)}
        >
          <Image
            source={require('../../assets/icon/receive_button.png')}
            style={{
              width: 20,
              height: 20
            }}
          />
        </TouchableOpacity>
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {getLanguageString(language, 'RECEIVE')}
        </CustomText>
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center', width: '33%'}}>
        <TouchableOpacity
          style={[styles.controlButton, {backgroundColor: theme.secondaryColor}]}
          onPress={() => {
            copyToClipboard(
              wallets[selectedWallet] ? wallets[selectedWallet].address : '',
            )
            Toast.show({
              type: 'success',
              topOffset: 70,
              text1: getLanguageString(language, 'COPIED'),
              props: {
                backgroundColor: theme.backgroundFocusColor,
                textColor: theme.textColor
              }
            });
          }}
        >
          <Image
            source={require('../../assets/icon/copy.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
        </TouchableOpacity>
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          Copy
        </CustomText>
      </View>
    </View>
  )
}