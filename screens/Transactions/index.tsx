import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useRecoilState } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import List from '../../components/List';
import { getTXHistory } from '../../services/api';
import { getMonthName } from '../../utils/date';
import { addZero, truncate } from '../../utils/string';
import { styles } from './style';

const TransactionScreen = () => {

  const [wallets, setWallets] = useRecoilState(walletsAtom)
  const [selectedWallet, setSelectedWallet] = useRecoilState(selectedWalletAtom)
  const [txList, setTxList] = useState([] as any[])

  const onSelect = (itemIndex: number) => {
    Alert.alert(`${itemIndex}`)
  }

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
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch' }}>
      <View style={{ flex: 1 }}>
        <List
          items={txList}
          render={(item, index) => {
            return (
              <View style={[{ padding: 15 }, index % 2 === 0 ? {backgroundColor: 'rgba(0,0,0,0.04)'} : {backgroundColor: '#FFFFFF'}]}>
                <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  {renderDate(item.date)}
                  <Text>{truncate(item.label, 10, 15)}</Text>
                  <Text
                    style={
                      [styles.kaiAmount, item.type === 'IN' ? { color: 'green' } : { color: 'red' }]
                    }
                  >
                    {item.type === 'IN' ? '+' : '-'}{item.amount} KAI
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }}
          onSelect={(itemIndex) => {
            Alert.alert(`${itemIndex}`)
          }}
        />
      </View>
    </SafeAreaView>
  )
}

export default TransactionScreen