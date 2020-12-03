import { useRoute } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { useRecoilState } from 'recoil'
import { ThemeContext } from '../../App'
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets'
import Divider from '../../components/Divider'
import { getTxDetail } from '../../services/api'
import { truncate } from '../../utils/string'
import { styles } from './style'

const TransactionDetail = () => {
    const theme = useContext(ThemeContext)
    const {params} = useRoute()
    const txHash = params ? (params as any).txHash : ''

    const [txData, setTxData] = useState<Transaction>()
    const [wallets] = useRecoilState(walletsAtom)
    const [selectedWallet] = useRecoilState(selectedWalletAtom)

    useEffect(() => {
        const data = getTxDetail(txHash)
        setTxData(data)
    }, [txHash])

    const renderStatusText = (status?: number) => {
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

    const renderStatusIcon = (status?: number) => {
        let iconName, iconColor

        if (status) {
            iconName = 'check-circle'
            iconColor = theme.successColor
        } else {
            iconName = 'x-circle'
            iconColor = theme.failColor
        }

        return (
            <View>
                <Icon name={iconName} size={70} color={iconColor} />
            </View>
        )
    }
    
    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.txMeta}>
                {
                    renderStatusIcon()
                }
                <View style={{justifyContent: 'space-between', paddingTop: 10}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={[{ fontSize: 18 }, { color: theme.textColor } ]}>Transaction Hash: </Text>
                        <Text style={[{ fontSize: 18, fontWeight: 'bold' }, { color: theme.textColor } ]}>{truncate(txHash, 7, 15)}</Text>
                    </View>
                </View>
            </View>
            <View style={{width: '100%'}}>
                <View style={{width: '100%', paddingHorizontal: 22}}>
                    <Text style={{color: theme.textColor, fontSize: 18, fontStyle: 'italic'}}>Detail</Text>
                    <Divider />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.infoTitle, { color: theme.textColor }]}>Amount</Text>
                    <Text style={[styles.infoValue, { color: theme.textColor }]}>{txData?.amount} KAI</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.infoTitle, { color: theme.textColor } ]}>From</Text>
                    <Text style={[styles.infoValue, { color: theme.textColor } ]}>{truncate(txData?.from || '', 10, 15)}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.infoTitle, { color: theme.textColor } ]}>To</Text>
                    <Text style={[styles.infoValue, { color: theme.textColor } ]}>{truncate(txData?.to || '', 10, 15)}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.infoTitle, { color: theme.textColor } ]}>Date</Text>
                    <Text style={[styles.infoValue, { color: theme.textColor } ]}>{txData?.date.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    )
}

export default TransactionDetail