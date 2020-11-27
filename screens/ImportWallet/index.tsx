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
                <Button title="Import with Private key" type="primary" onPress={() => navigation.navigate('ImportPrivateKey')} />
                <Button title="Import with Keystore file" type="primary" onPress={() => {}} />
                <Button title="Import with mnemonic phrase" type="primary" onPress={() => {}} />
            </View>
        </View>
    )
}

export default ImportWallet