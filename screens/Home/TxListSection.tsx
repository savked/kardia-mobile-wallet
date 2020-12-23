/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {formatDistanceToNowStrict, isSameDay, format} from 'date-fns';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import * as Sentry from '@sentry/react-native';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {ThemeContext} from '../../App';
import List from '../../components/List';
import {truncate} from '../../utils/string';
import {styles} from './style';
import {parseKaiBalance} from '../../utils/number';
import Button from '../../components/Button';
import {useRecoilValue} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {getTxByAddress} from '../../services/transaction';
import {
  getDateFNSLocale,
  getDateTimeFormat,
  getLanguageString,
} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';

const TxListSection = () => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  const [txList, setTxList] = useState([] as any[]);

  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const language = useRecoilValue(languageAtom);

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      status: tx.status,
      type:
        wallets[selectedWallet] && tx.from === wallets[selectedWallet].address
          ? 'OUT'
          : 'IN',
    };
  };

  const getTX = async () => {
    if (!wallets[selectedWallet].address) {
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
      Sentry.captureException(error);
    }
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

  const renderIcon = (status: number) => {
    return (
      <View style={{flex: 1, marginRight: 18}}>
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
          {status ? (
            <AntIcon
              name="checkcircle"
              size={20}
              color={'green'}
              style={{position: 'absolute', right: 0, bottom: 0}}
            />
          ) : (
            <AntIcon
              name="closecircle"
              size={20}
              color={'red'}
              style={{position: 'absolute', right: 0, bottom: 0}}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.transactionContainer}>
      <List
        items={txList}
        listStyle={{paddingHorizontal: 15}}
        render={(item) => {
          return (
            <View style={[{padding: 15}]}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
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
                    flex: 2.5,
                    flexDirection: 'column',
                  }}>
                  <Text style={{color: '#FFFFFF'}}>
                    {truncate(item.label, 6, 8)}
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
                    flex: 2.5,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text
                    style={[
                      styles.kaiAmount,
                      item.type === 'IN' ? {color: '#61b15a'} : {color: 'red'},
                    ]}>
                    {item.type === 'IN' ? '+' : '-'}
                    {parseKaiBalance(item.amount)} KAI
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.noTXText, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_TRANSACTION')}
          </Text>
        }
        header={
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'}}>
              {getLanguageString(language, 'RECENT_TRANSACTION')}
            </Text>
            <Button
              type="link"
              onPress={() =>
                navigation.navigate('Transaction', {
                  screen: 'TransactionList',
                })
              }
              title={`${getLanguageString(language, 'VIEW_ALL_TRANSACTION')} >`}
            />
          </View>
        }
      />
    </View>
  );
};

export default TxListSection;
