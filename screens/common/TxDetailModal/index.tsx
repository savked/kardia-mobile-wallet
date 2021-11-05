import { format } from 'date-fns';
/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState } from 'react';
import { Image, Linking, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { addressBookAtom } from '../../../atoms/addressBook';
import { languageAtom } from '../../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import Divider from '../../../components/Divider';
import Modal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import {
    getDateFNSLocale,
    getLanguageString,
    parseCardAvatar
} from '../../../utils/lang';
import { formatNumberString, parseDecimals } from '../../../utils/number';
import {
    getAddressAvatar, getFromAddressBook,


    getTxURL, truncate
} from '../../../utils/string';
import NewAddressModal from '../NewAddressModal';
import { styles } from './style';

export default ({
  txObj,
  visible,
  onClose,
}: {
  txObj?: Record<string, any>;
  visible: boolean;
  onClose: () => void;
}) => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const dateLocale = getDateFNSLocale(language);

  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const addressBook = useRecoilValue(addressBookAtom);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  const isNewContact = () => {
    return (
      getFromAddressBook(addressBook, getOtherAddress()) === getOtherAddress()
    );
  };

  const handleClickLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    });
  };

  const getOtherAddress = () => {
    if (
      !txObj ||
      !wallets[selectedWallet] ||
      !wallets[selectedWallet].address
    ) {
      return '';
    }
    if (txObj.from !== wallets[selectedWallet].address) {
      return txObj.from;
    }
    return txObj.to;
  };

  const renderOwnAddress = (address: string) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 12,
          marginTop: 4,
          backgroundColor: theme.backgroundColor,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}>
        <Image
          style={{width: 52, height: 32, marginRight: 12}}
          source={parseCardAvatar(wallets[selectedWallet].cardAvatarID || 0)}
        />
        <View>
          <CustomText style={{color: '#FFFFFF', fontWeight: 'bold'}}>
            {wallets[selectedWallet].name || getLanguageString(language, 'NEW_WALLET')}
          </CustomText>
          <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 12}}>
            {truncate(address, 10, 10)}
          </CustomText>
        </View>
      </View>
    );
  };

  const renderOtherAddress = (address: string) => {
    let isContract = false
    let name = ''
    if (txObj && txObj.toName && !txObj.isKRC20) {
      isContract = true
      name = txObj.toName
    } else if (isNewContact()) {
      name = getLanguageString(language, 'NEW_CONTACT')
    } else {
      name = getFromAddressBook(addressBook, address)
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 12,
          marginTop: 4,
          backgroundColor: theme.backgroundColor,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}>
          <View
            style={{
              width: 52,
              height: 32,
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {isNewContact() || getAddressAvatar(addressBook, address) === '' ? (
              <View style={styles.newContactAvatarContainer}>
                <Image
                  style={{width: 20, height: 20}}
                  source={require('../../../assets/icon/user.png')}
                />
              </View>
            ) : (
              <Image
                style={{width: 32, height: 32, borderRadius: 8}}
                source={{uri: getAddressAvatar(addressBook, address)}}
              />
            )}
          </View>
        <View>
          <CustomText style={{color: '#FFFFFF', fontWeight: 'bold'}}>
            {name}
          </CustomText>
          <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 12}}>
            {truncate(address, 10, 10)}
          </CustomText>
        </View>
        {isNewContact() && !isContract && (
          <View style={{alignItems: 'flex-end', flex: 1}}>
            <Button
              title={getLanguageString(language, 'SAVE_TO_ADDRESS_BOOK')}
              onPress={() => setShowAddAddressModal(true)}
              type="link"
              textStyle={{textDecorationLine: 'none', fontSize: 12}}
            />
          </View>
        )}
      </View>
    );
  };

  if (!txObj) {
    return null;
  }

  if (showAddAddressModal) {
    return (
      <NewAddressModal
        address={getOtherAddress()}
        visible={true}
        onClose={() => {
          setShowAddAddressModal(false);
        }}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={{backgroundColor: theme.backgroundFocusColor, height: Platform.OS === 'android' ? 540 : 520}}>
      <View style={[styles.container]}>
        <View
          style={{
            width: 64,
            height: 64,

            borderRadius: 16,
            backgroundColor: theme.backgroundColor,

            justifyContent: 'center',
            alignItems: 'center',

            position: 'absolute',
            top: -67,

            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 2,
            shadowRadius: 4,
            elevation: 9,
          }}>
          {txObj.type === 'IN' ? (
            <Image
              source={require('../../../assets/icon/receive.png')}
              style={styles.logo}
            />
          ) : (
            <Image
              source={require('../../../assets/icon/send.png')}
              style={styles.logo}
            />
          )}
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <CustomText
            allowFontScaling={false}
            style={[
              styles.amountText,
              {color: theme.textColor, marginRight: 12},
            ]}>
            {/* {parseKaiBalance(txObj.amount, true)} */}
            {formatNumberString(parseDecimals(txObj.amount, txObj.decimals), 4)}
          </CustomText>
          <CustomText style={{color: theme.textColor, fontSize: 18}}>{txObj.symbol || 'KAI'}</CustomText>
        </View>
        <TouchableOpacity onPress={() => handleClickLink(getTxURL(txObj.hash))}>
          <CustomText style={styles.txhash}>{truncate(txObj.hash, 14, 14)}</CustomText>
        </TouchableOpacity>
        <View>
          <View
            style={{
              backgroundColor: theme.backgroundColor,
              borderRadius: 4,
              paddingVertical: 9,
              paddingHorizontal: 12,
              marginTop: 12,
              flexDirection: 'row',
            }}>
            <Image
              style={{width: 16, height: 16, marginRight: 8}}
              source={require('../../../assets/icon/calendar.png')}
            />
            <CustomText style={{fontSize: 12, color: theme.textColor}}>
              {format(txObj.date, 'hh:mm aa, E dd/MM/yyyy', {
                locale: dateLocale,
              })}
            </CustomText>
          </View>
        </View>
        <Divider style={{width: '100%', backgroundColor: '#60636C'}} />
        <View style={{justifyContent: 'flex-start', width: '100%'}}>
          <CustomText style={{color: theme.mutedTextColor, fontSize: 12}}>
            {getLanguageString(language, 'FROM')}
          </CustomText>
          {txObj.from !== getOtherAddress()
            ? renderOwnAddress(txObj.from)
            : renderOtherAddress(txObj.from)}
        </View>
        <View
          style={{justifyContent: 'flex-start', width: '100%', marginTop: 12}}>
          <CustomText style={{color: theme.mutedTextColor, fontSize: 12}}>
            {getLanguageString(language, 'TO')}
          </CustomText>
          {txObj.to !== getOtherAddress()
            ? renderOwnAddress(txObj.to)
            : renderOtherAddress(txObj.to)}
        </View>
        <Divider style={{width: '100%', backgroundColor: '#60636C'}} />
        <View style={{justifyContent: 'flex-start', width: '100%'}}>
          <CustomText style={{color: theme.mutedTextColor, fontSize: 12}}>
            {getLanguageString(language, 'TRANSACTION_FEE')}
          </CustomText>
          <CustomText style={{color: theme.textColor, fontSize: 15}}>
            {formatNumberString(parseDecimals(txObj.txFee, 18))} KAI
          </CustomText>
        </View>
        <Divider style={{width: '100%', backgroundColor: '#60636C'}} />
        <Button
          title={getLanguageString(language, 'OK_TEXT')}
          type="primary"
          block={true}
          onPress={onClose}
          // textStyle={{fontWeight: 'bold'}}
          textStyle={{
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 3,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        />
      </View>
    </Modal>
  );
};
