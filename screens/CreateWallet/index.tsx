import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { View, Text } from 'react-native'
import Button from '../../components/Button'
import { styles } from './style'

const CreateWallet = () => {
    const navigation = useNavigation()
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create new wallet</Text>
            <View style={styles.optionContainer}>
                <Button title="Create with Private key" type="primary" onPress={() => navigation.navigate('CreateWithPrivateKey')} />
                <Button title="Create with Keystore file" type="primary" onPress={() => {}} />
                <Button title="Create with mnemonic phrase" type="primary" onPress={() => {}} />
            </View>
        </View>
    )
}

export default CreateWallet