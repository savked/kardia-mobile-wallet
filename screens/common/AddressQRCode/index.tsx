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
        height: 670,
        justifyContent: 'flex-start'
      }}
      onClose={onClose}>
      <View
        style={{
          padding: 32,
          backgroundColor: theme.backgroundStrongColor,
          borderRadius: 12,
        }}>
        <QRCode
          size={viewportWidth - 104}
          value={wallets[selectedWallet] ? wallets[selectedWallet].address : ''}
          color={theme.textColor}
          backgroundColor={theme.backgroundStrongColor}
        />
      </View>
      <View style={{flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center'}}>
        <Image source={require('../../../assets/icon/warning.png')} style={{width: 20, height: 20, marginRight: 8}} />
        <CustomText
          style={{
            fontWeight: '500',
            fontSize: 13,            
            color: theme.warningTextColor,
            textAlign: 'left',
            width: '100%',
          }}>
          {getLanguageString(language, 'ERC20_WARNING')}
        </CustomText>
      </View>
      <View
        // source={require('../../../assets/address_qr_balance_background.png')}
        // imageStyle={{
        //   resizeMode: 'cover',
        //   // width: '100%',
        //   height: 76,
        //   borderRadius: 12,
        //   // marginHorizontal: 18,
        // }}
        style={{
          width: '100%',
          height: 76,
          borderRadius: 12,
          alignItems: 'flex-start',
          justifyContent: 'center',
          // paddingHorizontal: 18,
          backgroundColor: theme.backgroundStrongColor,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 12,
          shadowRadius: 8,
          elevation: 9,
        }}
      >
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingTop: 2}}>
          <View style={{justifyContent: 'space-between', flex: 1}}>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 10, marginBottom: 4, textAlign: 'left'}}>
              {getLanguageString(language, 'ADDRESS').toUpperCase()}
            </CustomText>
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
          </View>
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
      </View>
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
