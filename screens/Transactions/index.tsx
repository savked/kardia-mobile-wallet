import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View, Keyboard } from 'react-native';
import { useRecoilState } from 'recoil';
import { ThemeContext } from '../../App';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import List from '../../components/List';
import TextInput from '../../components/TextInput';
import { getTXHistory } from '../../services/api';
import { getMonthName } from '../../utils/date';
import { addZero, truncate } from '../../utils/string';
import { styles } from './style';

const TransactionScreen = () => {

  const theme = useContext(ThemeContext)
  const navigation = useNavigation()

  const [wallets] = useRecoilState(walletsAtom)
  const [selectedWallet] = useRecoilState(selectedWalletAtom)
  const [txList, setTxList] = useState([] as any[])
  const [listHeight, setListHeight] = useState<number>()

  const [filterStartDate, setFilterStartDate] = useState(new Date())

  const handleShow = () => {
    setListHeight(370)
  }

  const handleHide = () => {
    setListHeight(undefined)
  }

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleShow);
    Keyboard.addListener('keyboardDidHide', handleHide);

    return () => {
      Keyboard.removeListener('keyboardDidShow', handleShow);
      Keyboard.removeListener('keyboardDidHide', handleHide);
    }

  }, [])

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      type: wallets[selectedWallet] && tx.from === wallets[selectedWallet].address ? 'OUT' : 'IN'
    }
  }

  const getTX = () => {
    getTXHistory(wallets[selectedWallet])
      .then(txList => setTxList(txList.map(parseTXForList)))
  }

  const renderDate = (date: Date) => {
    const dateStr = addZero(date.getDate())
    const monthStr = getMonthName(date.getMonth() + 1)
    return (
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.dateText}>{monthStr}</Text>
      </View>
    )
  }

  useEffect(() => {
    getTX()
  }, [selectedWallet])

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={[styles.controlContainer, { height: 80 } ]}>
        <TextInput block={true} placeholder="Search with address / tx hash / block number / block hash..." />
      </View>
      <View style={{height: listHeight, paddingHorizontal: 7}}>
        <List
          items={txList}
          render={(item, index) => {
            return (
              <View style={[{ padding: 15 }]}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  onPress={() => navigation.navigate('Transaction', { screen: 'TransactionDetail', initial: false, params: { txHash: item.label } })}
                >
                  {renderDate(item.date)}
                  <Text style={{ color: '#FFFFFF' }}>{truncate(item.label, 10, 15)}</Text>
                  <Text
                    style={
                      [styles.kaiAmount, item.type === 'IN' ? { color: '#53B680' } : { color: 'red' }]
                    }
                  >
                    {item.type === 'IN' ? '+' : '-'}{item.amount} KAI
                    </Text>
                </TouchableOpacity>
              </View>
            )
          }}
          header={
            <Text style={{ fontSize: 18, paddingHorizontal: 15, fontWeight: 'bold', color: '#FFFFFF' }}>Recent transactions</Text>
          }
          onSelect={(itemIndex) => {
            Alert.alert(`${itemIndex}`)
          }}
        />
      </View>
    </View>
  )
}

export default TransactionScreen