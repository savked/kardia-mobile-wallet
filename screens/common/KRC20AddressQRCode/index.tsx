/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {Dimensions, Image, ImageBackground, Platform, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import QRCode from 'react-native-qrcode-svg';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import { tokenInfoAtom } from '../../../atoms/token';
import {selectedWalletAtom, walletsAtom} from '../../../atoms/wallets';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import {ThemeContext} from '../../../ThemeContext';
import {getLanguageString} from '../../../utils/lang';
import {copyToClipboard, truncate} from '../../../utils/string';
import CustomText from '../../../components/Text';
import { formatNumberString, parseDecimals } from '../../../utils/number';

const {width: viewportWidth} = Dimensions.get('window');

const QRModal = ({
  onClose,
  visible,
  tokenSymbol,
  tokenBalance,
  tokenDecimals,
}: {
  visible: boolean;
  onClose: () => void;
  tokenSymbol: string;
  tokenBalance: string;
  tokenDecimals: number;
}) => {
  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const language = useRecoilValue(languageAtom);
  const tokenInfo = useRecoilValue(tokenInfoAtom);

  const theme = useContext(ThemeContext);

  const wallet = wallets[selectedWallet];

  return (
    <Modal
      visible={visible}
      showCloseButton={false}
      contentStyle={{
        paddingHorizontal: 20,
        backgroundColor: theme.backgroundFocusColor,
        height: 730,
      }}
      onClose={onClose}>
      <View
        style={{
          padding: 32,
          backgroundColor: theme.backgroundColor,
          borderRadius: 12,
        }}>
        <QRCode
          size={viewportWidth - 104}
          value={wallets[selectedWallet] ? wallets[selectedWallet].address : ''}
          color={theme.textColor}
          backgroundColor={theme.backgroundColor}
        />
      </View>
      <ImageBackground
        source={require('../../../assets/address_qr_balance_background.png')}
        imageStyle={{
          resizeMode: 'cover',
          // width: '100%',
          height: 139,
          borderRadius: 12,
          // marginHorizontal: 18,
        }}
        style={{
          width: '100%',
          height: 139,
          borderRadius: 12,
          alignItems: 'flex-start',
          justifyContent: 'center',
          // paddingHorizontal: 18,
        }}
      >
        <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 10, marginBottom: 4, textAlign: 'left', paddingHorizontal: 20}}>
          {getLanguageString(language, 'BALANCE').toUpperCase()}
        </CustomText>
        <CustomText style={{fontSize: 24, color: 'white', paddingHorizontal: 20}}>
          {formatNumberString(parseDecimals(tokenBalance, tokenDecimals), 6)}{' '}{tokenSymbol}
        </CustomText>
        <View style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20}}>
          <CustomText style={{
              color: '#FFFFFF',
              fontSize: 16,
              marginRight: 8,
            }}>
            {truncate(
              wallet.address,
              viewportWidth >= 432 ? 14 : 10,
              viewportWidth >= 432 ? 14 : 12,
            )}
          </CustomText>
          <TouchableOpacity
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
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image source={require('../../../assets/icon/copy_dark.png')} style={{width: 20, height: 20}} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <Button
        title={getLanguageString(language, 'DONE')}
        onPress={onClose}
        block
        style={{marginTop: 32}}
        textStyle={{
          fontWeight: '500',
          fontSize: theme.defaultFontSize + 3,
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
        }}
      />
    </Modal>
  );
};

export default QRModal;
