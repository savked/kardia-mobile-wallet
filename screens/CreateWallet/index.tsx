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
                <Button 
                    iconName="lock"
                    iconSize={60}
                    iconColor="#AD182A"
                    size="large"
                    title="Create with Private key" 
                    type="outline" 
                    onPress={() => navigation.navigate('CreateWithPrivateKey')} 
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
                    title="Create with Keystore file" 
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
                    title="Create with mnemonic phrase" 
                    type="outline" 
                    onPress={() => {}} 
                    style={{
                        justifyContent: 'space-between',
                        paddingVertical: 15,
                        paddingHorizontal: 60,
                        borderWidth: 2
                    }}
                />
                <Text style={styles.accessWalletText}>
                    Already have wallet ? {' '} 
                    <Text style={styles.accessLink} onPress={() => navigation.navigate('ImportWallet')} >Access here</Text>
                </Text>
            </View>
        </View>
    )
}

export default CreateWallet