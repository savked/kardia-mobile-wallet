import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, Text } from 'react-native'
import Button from '../../components/Button'
import {styles} from './style'

const ImportWallet = () => {
    const navigation = useNavigation()
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Import your wallet</Text>
            <View style={styles.optionContainer}>
                <Button 
                    iconName="lock"
                    iconSize={60}
                    iconColor="#AD182A"
                    size="large"
                    title="Import with Private key"
                    type="outline"
                    onPress={() => navigation.navigate('ImportPrivateKey')}
                    style={{
                        justifyContent: 'space-between',
                        paddingVertical: 15,
                        paddingHorizontal: 60,
                        borderWidth: 2
                    }}
                />
                <Button
                    iconName="file"
                    iconSize={60}
                    iconColor="#AD182A"
                    size="large"
                    title="Import with Keystore file" 
                    type="outline" 
                    onPress={() => {}} 
                    style={{
                        justifyContent: 'space-between',
                        paddingVertical: 15,
                        paddingHorizontal: 60,
                        borderWidth: 2
                    }}
                />
                <Button
                    iconName="book"
                    iconSize={60}
                    iconColor="#AD182A"
                    size="large"
                    title="Import with Mnemonic phrase" 
                    type="outline" 
                    onPress={() => navigation.navigate('ImportMnemonic')}
                    style={{
                        justifyContent: 'space-between',
                        paddingVertical: 15,
                        paddingHorizontal: 60,
                        borderWidth: 2
                    }}
                />
                <Text style={styles.accessWalletText}>
                    No wallet ? {' '} 
                    <Text style={styles.accessLink} onPress={() => navigation.navigate('CreateWallet')} >Create new wallet here</Text>
                </Text>
            </View>
        </View>
    )
}

export default ImportWallet