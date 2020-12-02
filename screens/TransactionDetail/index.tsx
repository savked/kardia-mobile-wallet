import { useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { useRecoilState } from 'recoil'
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets'
import { getTxDetail } from '../../services/api'
import { truncate } from '../../utils/string'
import { styles } from './style'

const TransactionDetail = () => {
    const {params} = useRoute()
    const txHash = params ? (params as any).txHash : ''

    const [txData, setTxData] = useState<Transaction>()
    const [wallets] = useRecoilState(walletsAtom)
    const [selectedWallet] = useRecoilState(selectedWalletAtom)

    useEffect(() => {
        const data = getTxDetail(txHash)
        setTxData(data)
    }, [txHash])

    const getIconName = () => {
        if (wallets[selectedWallet].address === txData?.from) return "corner-right-up"
        else if (wallets[selectedWallet].address === txData?.to) return "corner-right-down"
        return "file-text"
    }

    const renderStatus = (status?: number) => {
        return (
            <View style={[styles.statusContainer ]}>
                <Text style={[styles.statusText, status ? {color: 'green'} : {color: 'red'}]}>
                    {
                        status ? "Transaction success" : "Transaction failed"
                    }
                </Text>
            </View>
        )
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.txMeta}>
                <Icon name={getIconName()} size={70} />
                <View style={{justifyContent: 'space-between'}}>
                    <Text style={styles.infoValue}>{txData?.amount} KAI</Text>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.infoTitle}>Transaction Hash: </Text>
                        <Text style={styles.infoValue}>{truncate(txHash, 7, 15)}</Text>
                    </View>
                    <Text>{renderStatus(txData?.status)}</Text>
                </View>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Transaction Hash</Text>
                <Text style={styles.infoValue}>{truncate(txHash, 10, 15)}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Amount</Text>
                <Text style={styles.infoValue}>{txData?.amount} KAI</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>From</Text>
                <Text style={styles.infoValue}>{truncate(txData?.from || '', 10, 15)}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>To</Text>
                <Text style={styles.infoValue}>{truncate(txData?.to || '', 10, 15)}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Date</Text>
                <Text style={styles.infoValue}>{txData?.date.toLocaleString()}</Text>
            </View>
        </View>
    )
}

export default TransactionDetail