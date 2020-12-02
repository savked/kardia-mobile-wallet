import { useNavigation } from '@react-navigation/native'
import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { ThemeContext } from '../../App'
import Button from '../../components/Button'
import { styles } from './style'

const CreateWallet = () => {
    const navigation = useNavigation()
    const theme = useContext(ThemeContext);
    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <Text style={[styles.title, { color: theme.textColor } ]}>Create new wallet</Text>
            <View style={styles.optionContainer}>
                <Button 
                    iconName="lock"
                    iconSize={60}
                    iconColor="#FFFFFF"
                    size="large"
                    title="Create with Private key" 
                    type="primary" 
                    onPress={() => navigation.navigate('CreateWithPrivateKey')} 
                    textStyle={{
                        fontWeight: 'bold',
                        marginLeft: 10
                    }}
                    style={{
                        justifyContent: 'flex-start',
                        paddingVertical: 15,
                        paddingHorizontal: 60,
                        borderWidth: 2
                    }}
                />
                <Button 
                    iconName="file"
                    iconSize={60}
                    iconColor="#FFFFFF"
                    size="large"
                    title="Create with Keystore file" 
                    type="primary" 
                    onPress={() => {}} 
                    textStyle={{
                        fontWeight: 'bold',
                        marginLeft: 10
                    }}
                    style={{
                        justifyContent: 'flex-start',
                        paddingVertical: 15,
                        paddingHorizontal: 60,
                        borderWidth: 2
                    }}
                />
                <Button 
                    iconName="book"
                    iconSize={60}
                    iconColor="#FFFFFF"
                    size="large"
                    title="Create with mnemonic phrase" 
                    type="primary" 
                    onPress={() => navigation.navigate('CreateWithMnemonicPhrase')} 
                    textStyle={{
                        fontWeight: 'bold',
                        marginLeft: 10
                    }}
                    style={{
                        justifyContent: 'flex-start',
                        paddingVertical: 15,
                        paddingHorizontal: 60,
                        borderWidth: 2
                    }}
                />
                <Text style={[styles.accessWalletText, { color: theme.textColor } ]}>
                    Already have wallet ? {' '} 
                    <Text style={[styles.accessLink, { color: theme.primaryColor } ]} onPress={() => navigation.navigate('ImportWallet')} >Access here</Text>
                </Text>
            </View>
        </View>
    )
}

export default CreateWallet