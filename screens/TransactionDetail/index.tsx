/* eslint-disable react-native/no-inline-styles */
import { useNavigation, useRoute } from '@react-navigation/native';
import { format, formatDistanceToNowStrict, isSameDay } from 'date-fns';
import numeral from 'numeral';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useRecoilValue } from 'recoil';
import { addressBookAtom } from '../../atoms/addressBook';
import { languageAtom } from '../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import Button from '../../components/Button';
import Divider from '../../components/Divider';
import IconButton from '../../components/IconButton';
import CustomText from '../../components/Text';
import { getTxDetail } from '../../services/transaction';
import { ThemeContext } from '../../ThemeContext';
import {
    getDateFNSLocale,
    getDateTimeFormat,
    getLanguageString
} from '../../utils/lang';
import {
    copyToClipboard,
    getFromAddressBook,
    getTxURL,
    truncate
} from '../../utils/string';
import { styles } from './style';

const TransactionDetail = () => {
  const theme = useContext(ThemeContext);
  const {params} = useRoute();
  const txHash = params ? (params as any).txHash : '';
  const navigation = useNavigation();

  const addressBook = useRecoilValue(addressBookAtom);
  const language = useRecoilValue(languageAtom);
  const [txData, setTxData] = useState<Transaction>();

  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);

  useEffect(() => {
    (async () => {
      const data = await getTxDetail(txHash);
      setTxData(data);
    })();
  }, [txHash]);

  const getOtherAddress = () => {
    if (
      !txData ||
      !wallets[selectedWallet] ||
      !wallets[selectedWallet].address
    ) {
      return '';
    }
    if (txData.from !== wallets[selectedWallet].address) {
      return txData.from;
    }
    return txData.to;
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

  const renderStatusIcon = (status?: number) => {
    let iconName, iconColor;

    if (status) {
      iconName = 'check-circle';
      iconColor = theme.successColor;
    } else {
      iconName = 'x-circle';
      iconColor = theme.failColor;
    }

    return (
      <View>
        <Icon name={iconName} size={70} color={iconColor} />
      </View>
    );
  };

  if (!txData) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ActivityIndicator color={theme.textColor} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.txMeta}>
        {renderStatusIcon(txData?.status)}
        <View style={{justifyContent: 'space-between', paddingTop: 10}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <CustomText style={[{fontSize: 18}, {color: theme.textColor}]}>
              {getLanguageString(language, 'TRANSACTION_HASH')}:{' '}
            </CustomText>
            <Button
              type="link"
              onPress={() => handleClickLink(getTxURL(txHash))}
              title={truncate(txHash, 10, 10)}
              textStyle={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.textColor,
              }}
            />
            {/* <CustomText
              allowFontScaling={false}
              style={[
                {fontSize: 18, fontWeight: 'bold'},
                {color: theme.textColor},
              ]}>
              {truncate(txHash, 7, 7)}
            </CustomText> */}
          </View>
        </View>
      </View>
      <View style={{width: '100%'}}>
        <View style={{width: '100%', paddingHorizontal: 22}}>
          <CustomText
            allowFontScaling={false}
            style={{color: theme.textColor, fontSize: 18, fontStyle: 'italic'}}>
            {getLanguageString(language, 'TRANSACTION_DETAIL')}
          </CustomText>
          <Divider />
        </View>
        <View style={styles.infoContainer}>
          <CustomText style={[styles.infoTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'TRANSACTION_AMOUNT')}
          </CustomText>
          <CustomText style={[styles.infoValue, {color: theme.textColor}]}>
            {numeral(txData?.amount).format('0,0.00')} KAI
          </CustomText>
        </View>
        <View style={styles.infoContainer}>
          <CustomText style={[styles.infoTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'TRANSACTION_FEE')}
          </CustomText>
          <CustomText style={[styles.infoValue, {color: theme.textColor}]}>
            {txData.fee} KAI
          </CustomText>
        </View>
        <View style={styles.infoContainer}>
          <CustomText style={[styles.infoTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'FROM')}
          </CustomText>
          <View style={{flexDirection: 'row'}}>
            <CustomText
              allowFontScaling={false}
              style={[
                styles.infoValue,
                {color: theme.textColor, marginRight: 6},
              ]}>
              {truncate(
                getFromAddressBook(addressBook, txData?.from || ''),
                10,
                10,
              )}
            </CustomText>
            <IconButton
              color={theme.textColor}
              name="copy"
              size={16}
              onPress={() => copyToClipboard(txData?.from)}
            />
          </View>
        </View>
        <View style={styles.infoContainer}>
          <CustomText style={[styles.infoTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'TO')}
          </CustomText>
          <View style={{flexDirection: 'row'}}>
            <CustomText
              allowFontScaling={false}
              style={[
                styles.infoValue,
                {color: theme.textColor, marginRight: 6},
              ]}>
              {truncate(
                getFromAddressBook(addressBook, txData?.to || ''),
                10,
                10,
              )}
            </CustomText>
            <IconButton
              color={theme.textColor}
              name="copy"
              size={16}
              onPress={() => copyToClipboard(txData?.to)}
            />
          </View>
        </View>
        <View style={styles.infoContainer}>
          <CustomText style={[styles.infoTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'TRANSACTION_DATE')}
          </CustomText>
          <CustomText style={[styles.infoValue, {color: theme.textColor}]}>
            {isSameDay(txData.date, new Date())
              ? `${formatDistanceToNowStrict(txData.date, {
                  locale: getDateFNSLocale(language),
                })} ${getLanguageString(language, 'AGO')}`
              : format(txData.date, getDateTimeFormat(language), {
                  locale: getDateFNSLocale(language),
                })}
          </CustomText>
        </View>
        <View
          style={{marginTop: 15, paddingHorizontal: 22, paddingVertical: 8}}>
          {getFromAddressBook(addressBook, getOtherAddress()) ===
            getOtherAddress() && (
            <Button
              title={getLanguageString(language, 'SAVE_TO_ADDRESS_BOOK')}
              type="secondary"
              block
              style={{marginBottom: 14}}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Address',
                      state: {
                        routes: [
                          {name: 'AddressBook'},
                          {
                            name: 'NewAddress',
                            params: {
                              address: getOtherAddress(),
                            },
                          },
                        ],
                      },
                    },
                  ],
                });
              }}
            />
          )}
          <Button
            title={getLanguageString(language, 'GO_BACK')}
            type="outline"
            block
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TransactionDetail;
