/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Alert, Text, TouchableOpacity, View, Keyboard} from 'react-native';
import {useRecoilState} from 'recoil';
import {ThemeContext} from '../../App';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import List from '../../components/List';
import TextInput from '../../components/TextInput';
import {truncate} from '../../utils/string';
import {styles} from './style';
import IconM from 'react-native-vector-icons/MaterialIcons';
import {getTxByAddress} from '../../services/transaction';
import {parseKaiBalance} from '../../utils/number';

const TransactionScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  const [wallets] = useRecoilState(walletsAtom);
  const [selectedWallet] = useRecoilState(selectedWalletAtom);
  const [txList, setTxList] = useState([] as any[]);
  const [listHeight, setListHeight] = useState<number>();

  const handleShow = () => {
    setListHeight(370);
  };

  const handleHide = () => {
    setListHeight(undefined);
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleShow);
    Keyboard.addListener('keyboardDidHide', handleHide);

    return () => {
      Keyboard.removeListener('keyboardDidShow', handleShow);
      Keyboard.removeListener('keyboardDidHide', handleHide);
    };
  }, []);

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      type:
        wallets[selectedWallet] && tx.from === wallets[selectedWallet].address
          ? 'OUT'
          : 'IN',
    };
  };

  const getTX = () => {
    getTxByAddress(wallets[selectedWallet].address).then((newTxList) =>
      setTxList(newTxList.map(parseTXForList)),
    );
    // getTXHistory(wallets[selectedWallet]).then((newTxList) =>
    //   setTxList(newTxList.map(parseTXForList)),
    // );
  };

  const renderIcon = () => {
    return (
      <View>
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
          <IconM name={'attach-money'} size={30} color={'red'} />
        </View>
        <IconM
          name={'verified'}
          size={20}
          color={'green'}
          style={{position: 'absolute', right: 0, bottom: 0}}
        />
      </View>
    );
  };

  useEffect(() => {
    getTX();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Text style={[styles.headline, {color: theme.textColor}]}>
        Transactions
      </Text>
      <View style={[styles.controlContainer, {height: 80}]}>
        <TextInput
          block={true}
          placeholder="Search with address / tx hash / block number / block hash..."
        />
      </View>
      <View style={{height: listHeight, paddingHorizontal: 7}}>
        <List
          items={txList}
          render={(item) => {
            return (
              <View style={[{padding: 15}]}>
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
                  {renderIcon()}
                  <View style={{flexDirection: 'column'}}>
                    <Text style={{color: '#FFFFFF'}}>
                      {truncate(item.label, 8, 12)}
                    </Text>
                    <Text style={{color: 'gray'}}>
                      {item.date.toLocaleString()}
                    </Text>
                    <Text style={{color: '#FFFFFF'}}>Success</Text>
                  </View>
                  <Text
                    style={[
                      styles.kaiAmount,
                      item.type === 'IN' ? {color: '#53B680'} : {color: 'red'},
                    ]}>
                    {item.type === 'IN' ? '+' : '-'}
                    {parseKaiBalance(item.amount)} KAI
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          // header={
          //   <Text style={{ fontSize: 18, paddingHorizontal: 15, fontWeight: 'bold', color: '#FFFFFF' }}>Recent transactions</Text>
          // }
          onSelect={(itemIndex) => {
            Alert.alert(`${itemIndex}`);
          }}
        />
      </View>
    </View>
  );
};

export default TransactionScreen;
