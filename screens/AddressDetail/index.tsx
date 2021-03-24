/* eslint-disable react-native/no-inline-styles */
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Alert, Image, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {ThemeContext} from '../../ThemeContext';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import {
  getDateFNSLocale,
  getDateTimeFormat,
  getLanguageString,
} from '../../utils/lang';
import {
  getSelectedWallet,
  getWallets,
  saveAddressBook,
} from '../../utils/local';
import {styles} from './style';
import {statusBarColorAtom} from '../../atoms/statusBar';
import {copyToClipboard, truncate} from '../../utils/string';
import {showTabBarAtom} from '../../atoms/showTabBar';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {getTxByAddress} from '../../services/transaction';
import {groupByDate} from '../../utils/date';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {format, formatDistanceToNowStrict, isSameDay} from 'date-fns';
import List from '../../components/List';
import {parseKaiBalance} from '../../utils/number';

const AddressDetail = () => {
  const {params} = useRoute();
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const [txList, setTxList] = useState([] as any[]);
  const addressHash = params ? (params as any).addressHash : '';
  const [addressBook, setAddressBook] = useRecoilState(addressBookAtom);
  const [addressData, setAddressData] = useState<Address>();
  const language = useRecoilValue(languageAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);
  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const [showTxDetail, setShowTxDetail] = useState(false);
  const [txObjForDetail, setTxObjForDetail] = useState();

  const removeAddress = () => {
    Alert.alert('', 'Are you sure you want to delete this address ?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: "Yes I'm sure",
        onPress: () => {
          const _addressBook: Address[] = JSON.parse(
            JSON.stringify(addressBook),
          );
          setAddressBook(
            _addressBook.filter((item) => item.address !== addressHash),
          );
          saveAddressBook(
            _addressBook.filter((item) => item.address !== addressHash),
          );
          navigation.goBack();
        },
      },
    ]);
  };

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      from: tx.from,
      to: tx.to,
      hash: tx.hash,
      txFee: tx.fee,
      blockHash: tx.blockHash || '',
      blockNumber: tx.blockNumber || '',
      status: tx.status,
      type:
        wallets[selectedWallet] && tx.from === wallets[selectedWallet].address
          ? 'OUT'
          : 'IN',
    };
  };

  const getTX = async () => {
    const localWallets = await getWallets();
    const localSelectedWallet = await getSelectedWallet();
    if (
      !localWallets[localSelectedWallet] ||
      !localWallets[localSelectedWallet].address
    ) {
      return;
    }
    // if (!wallets[selectedWallet] || !wallets[selectedWallet].address) {
    //   return;
    // }
    try {
      const newTxList = await getTxByAddress(
        localWallets[localSelectedWallet].address,
        1,
        1000,
      );
      setTxList(
        newTxList
          .filter((txItem: Transaction) => {
            return (
              txItem.from === addressData?.address ||
              txItem.to === addressData?.address
            );
          })
          .map(parseTXForList),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const renderIcon = (status: number, type: 'IN' | 'OUT') => {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            width: 32,
            height: 32,

            borderRadius: 12,
            backgroundColor: theme.backgroundColor,

            // flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            // borderWidth: 1,
            // borderColor: 'gray',
          }}>
          {type === 'IN' ? (
            <Image
              source={require('../../assets/icon/receive.png')}
              style={styles.kaiLogo}
            />
          ) : (
            <Image
              source={require('../../assets/icon/send.png')}
              style={styles.kaiLogo}
            />
          )}
        </View>
        {status ? (
          <AntIcon
            name="checkcircle"
            size={14}
            color={'green'}
            style={{position: 'absolute', right: 0, bottom: 0}}
          />
        ) : (
          <AntIcon
            name="closecircle"
            size={14}
            color={'red'}
            style={{position: 'absolute', right: 0, bottom: 0}}
          />
        )}
      </View>
    );
  };

  useEffect(() => {
    getTX();
    const getTxInterval = setInterval(() => {
      getTX();
    }, 3000);
    return () => clearInterval(getTxInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    setStatusBarColor(theme.backgroundFocusColor);
  }, [setStatusBarColor, theme.backgroundFocusColor]);

  useEffect(() => {
    const addressItem = addressBook.find(
      (item) => item.address === addressHash,
    );
    if (!addressItem) {
      return;
    }
    const _addressData: Address = JSON.parse(JSON.stringify(addressItem));
    setAddressData(_addressData);
  }, [addressHash, addressBook]);

  if (!addressData) {
    return (
      <View>
        <Text>Invalid address</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View
        style={{
          backgroundColor: theme.backgroundFocusColor,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          <Icon.Button
            name="chevron-left"
            onPress={() => navigation.goBack()}
            backgroundColor="transparent"
          />
          <Icon.Button
            name="edit"
            onPress={() => navigation.goBack()}
            backgroundColor="transparent"
          />
        </View>
        {addressData.avatar ? (
          <Image source={{uri: addressData.avatar}} />
        ) : (
          <View
            style={{
              backgroundColor: theme.backgroundColor,
              width: 80,
              height: 80,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 24,
            }}>
            <Image
              style={{width: 48, height: 48}}
              source={require('../../assets/icon/user_dark.png')}
            />
          </View>
        )}
        <Text
          style={{
            color: theme.textColor,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            marginVertical: 16,
          }}>
          {addressData.name}
        </Text>
        <View style={{marginBottom: 24, flexDirection: 'row'}}>
          <Text
            style={{
              color: 'rgba(252, 252, 252, 0.54)',
              textAlign: 'center',
              fontSize: 15,
              marginRight: 8,
            }}>
            {truncate(addressData.address, 10, 10)}
          </Text>
          <TouchableOpacity
            style={{
              width: 24,
              height: 24,
              backgroundColor: 'rgba(249, 249, 249, 1)',
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => copyToClipboard(addressData.address)}>
            <Image
              style={{width: 20, height: 20}}
              source={require('../../assets/icon/copy_dark.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{padding: 20}}>
        <Text
          style={{
            color: theme.textColor,
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 12,
          }}>
          {getLanguageString(language, 'RECENT_TRANSACTION')}
        </Text>
        {groupByDate(txList, 'date').length === 0 && (
          <Text
            style={[
              styles.noTXText,
              {color: theme.textColor, fontSize: theme.defaultFontSize},
            ]}>
            {getLanguageString(language, 'NO_TRANSACTION')}
          </Text>
        )}
        {groupByDate(txList, 'date').map((txsByDate) => {
          const dateLocale = getDateFNSLocale(language);
          return (
            <React.Fragment key={`transaction-by-${txsByDate.date.getTime()}`}>
              <Text
                style={{
                  color: theme.textColor,
                }}>
                {format(txsByDate.date, 'E, dd/MM/yyyy', {locale: dateLocale})}
              </Text>
              <List
                // containerStyle={{flex: 1}}
                items={txsByDate.items}
                render={(item) => {
                  return (
                    <View
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        // marginHorizontal: 20,
                        marginVertical: 8,
                        borderRadius: 8,
                        backgroundColor: theme.backgroundFocusColor,
                      }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          setTxObjForDetail(item);
                          setShowTxDetail(true);
                        }}>
                        {renderIcon(item.status, item.type)}
                        <View
                          style={{
                            flexDirection: 'column',
                            flex: 4,
                            paddingHorizontal: 14,
                          }}>
                          <Text style={{color: '#FFFFFF'}}>
                            {item.type === 'IN'
                              ? getLanguageString(language, 'TX_TYPE_RECEIVED')
                              : getLanguageString(language, 'TX_TYPE_SEND')}
                          </Text>
                          <Text style={{color: '#DBDBDB', fontSize: 12}}>
                            {truncate(item.label, 8, 10)}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 3,
                            alignItems: 'flex-end',
                          }}>
                          <Text
                            style={[
                              styles.kaiAmount,
                              item.type === 'IN'
                                ? {color: '#53B680'}
                                : {color: 'red'},
                            ]}>
                            {item.type === 'IN' ? '+' : '-'}
                            {parseKaiBalance(item.amount, true)} KAI
                          </Text>
                          <Text style={{color: '#DBDBDB', fontSize: 12}}>
                            {isSameDay(item.date, new Date())
                              ? `${formatDistanceToNowStrict(item.date, {
                                  locale: getDateFNSLocale(language),
                                })} ${getLanguageString(language, 'AGO')}`
                              : format(item.date, getDateTimeFormat(language), {
                                  locale: getDateFNSLocale(language),
                                })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                }}
                onSelect={(itemIndex) => {
                  Alert.alert(`${itemIndex}`);
                }}
              />
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default AddressDetail;
