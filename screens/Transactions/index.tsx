/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Alert, Text, TouchableOpacity, View, Image} from 'react-native';
import {useRecoilState, useRecoilValue} from 'recoil';
import {SafeAreaView} from 'react-native-safe-area-context';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import List from '../../components/List';
import TextInput from '../../components/TextInput';
import {truncate} from '../../utils/string';
import {styles} from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {getTxByAddress} from '../../services/transaction';
import {parseKaiBalance} from '../../utils/number';
import {format, formatDistanceToNowStrict, isSameDay} from 'date-fns';
import {addressBookAtom} from '../../atoms/addressBook';
import IconButton from '../../components/IconButton';
import {
  getDateFNSLocale,
  getDateTimeFormat,
  getLanguageString,
} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
import NewTxModal from '../common/NewTxModal';
import {ThemeContext} from '../../ThemeContext';

const TransactionScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  const [wallets] = useRecoilState(walletsAtom);
  const [selectedWallet] = useRecoilState(selectedWalletAtom);
  const [txList, setTxList] = useState([] as any[]);
  const [filterTx, setFilterTx] = useState('');
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const addressBook = useRecoilValue(addressBookAtom);
  const language = useRecoilValue(languageAtom);

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      from: tx.from,
      to: tx.to,
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
    if (wallets[selectedWallet] || wallets[selectedWallet].address) {
      return;
    }
    try {
      const newTxList = await getTxByAddress(
        wallets[selectedWallet].address,
        1,
        30,
      );
      setTxList(newTxList.map(parseTXForList));
    } catch (error) {
      console.error(error);
    }
  };

  const filterTransaction = (tx: any) => {
    if (filterTx.length < 3) {
      return true;
    }
    if (
      tx.label.toUpperCase().includes(filterTx.toUpperCase()) ||
      tx.blockHash.toUpperCase().includes(filterTx.toUpperCase()) ||
      tx.blockNumber.includes(filterTx)
    ) {
      return true;
    }
    const posibleAddress = addressBook.filter((item) =>
      item.name.toUpperCase().includes(filterTx.toUpperCase()),
    );
    const existed = posibleAddress.find((item) => item.address === tx.from);
    if (existed) {
      return true;
    }
    return false;
  };

  const renderIcon = (status: number) => {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            width: 50,
            height: 50,

            borderRadius: 25,
            backgroundColor: 'white',

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            borderWidth: 1,
            borderColor: 'gray',
          }}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.kaiLogo}
          />
        </View>
        {status ? (
          <AntIcon
            name="checkcircle"
            size={20}
            color={'green'}
            style={{position: 'absolute', right: -7, bottom: 0}}
          />
        ) : (
          <AntIcon
            name="closecircle"
            size={20}
            color={'red'}
            style={{position: 'absolute', right: -7, bottom: 0}}
          />
        )}
      </View>
    );
  };

  useEffect(() => {
    getTX();
    const getTxInterval = setInterval(() => {
      if (wallets[selectedWallet]) {
        getTX();
      }
    }, 3000);
    return () => clearInterval(getTxInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <NewTxModal
        visible={showNewTxModal}
        onClose={() => setShowNewTxModal(false)}
      />
      <View style={styles.header}>
        <Text style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'RECENT_TRANSACTION')}
        </Text>
        <IconButton
          name="plus-circle"
          color={theme.textColor}
          size={styles.headline.fontSize}
          // onPress={() => navigation.navigate('CreateTx')}
          onPress={() => setShowNewTxModal(true)}
        />
      </View>
      <View style={styles.controlContainer}>
        <TextInput
          block={true}
          placeholder={getLanguageString(
            language,
            'SEARCH_TRANSACTION_PLACEHOLDER',
          )}
          value={filterTx}
          onChangeText={setFilterTx}
        />
      </View>
      <View style={{flex: 1}}>
        <List
          items={txList.filter(filterTransaction)}
          render={(item, index) => {
            return (
              <View
                style={{
                  padding: 15,
                  backgroundColor:
                    index % 2 === 0
                      ? theme.backgroundFocusColor
                      : theme.backgroundColor,
                }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() =>
                    navigation.navigate('Transaction', {
                      screen: 'TransactionDetail',
                      initial: false,
                      params: {txHash: item.label},
                    })
                  }>
                  {renderIcon(item.status)}
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 4,
                      paddingHorizontal: 14,
                    }}>
                    <Text style={{color: '#FFFFFF'}}>
                      {truncate(item.label, 8, 10)}
                    </Text>
                    <Text style={{color: 'gray'}}>
                      {isSameDay(item.date, new Date())
                        ? `${formatDistanceToNowStrict(item.date, {
                            locale: getDateFNSLocale(language),
                          })} ${getLanguageString(language, 'AGO')}`
                        : format(item.date, getDateTimeFormat(language), {
                            locale: getDateFNSLocale(language),
                          })}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 3,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}>
                    <Text
                      style={[
                        styles.kaiAmount,
                        item.type === 'IN'
                          ? {color: '#53B680'}
                          : {color: 'red'},
                      ]}>
                      {item.type === 'IN' ? '+' : '-'}
                      {parseKaiBalance(item.amount)} KAI
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          onSelect={(itemIndex) => {
            Alert.alert(`${itemIndex}`);
          }}
          ListEmptyComponent={
            <Text style={[styles.noTXText, {color: theme.textColor}]}>
              {getLanguageString(language, 'NO_TRANSACTION')}
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default TransactionScreen;
