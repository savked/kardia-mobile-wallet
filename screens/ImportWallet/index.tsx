import { useNavigation } from '@react-navigation/native'
import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { ThemeContext } from '../../App'
import Button from '../../components/Button'
import {styles} from './style'

const ImportWallet = () => {
    const navigation = useNavigation()
    const theme = useContext(ThemeContext);
    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <Text style={[styles.title, { color: theme.textColor } ]}>Import your wallet</Text>
            <View style={styles.optionContainer}>
                <Button 
                    iconName="lock"
                    iconSize={60}
                    iconColor="#FFFFFF"
                    size="large"
                    title="Import with Private key"
                    type="primary"
                    onPress={() => navigation.navigate('ImportPrivateKey')}
                    textStyle={{
                        fontWeight: 'bold',
                        marginLeft: 10
                    }}
                    style={{
                        justifyContent: 'flex-start',
                        paddingVertical: 15,
                        paddingHorizontal: 60
                    }}
                />
                <Button
                    iconName="file"
                    iconSize={60}
                    iconColor="#FFFFFF"
                    size="large"
                    title="Import with Keystore file" 
                    type="primary" 
                    onPress={() => {}} 
                    textStyle={{
                        fontWeight: 'bold',
                        marginLeft: 10
                    }}
                    style={{
                        justifyContent: 'flex-start',
                        paddingVertical: 15,
                        paddingHorizontal: 60
                    }}
                />
                <Button
                    iconName="book"
                    iconSize={60}
                    iconColor="#FFFFFF"
                    size="large"
                    title="Import with Mnemonic phrase" 
                    type="primary" 
                    onPress={() => navigation.navigate('ImportMnemonic')}
                    textStyle={{
                        fontWeight: 'bold',
                        marginLeft: 10
                    }}
                    style={{
                        justifyContent: 'flex-start',
                        paddingVertical: 15,
                        paddingHorizontal: 60
                    }}
                />
                <Text style={[styles.accessWalletText, { color: theme.textColor } ]}>
                    No wallet ? {' '} 
                    <Text style={[styles.accessLink, { color: theme.primaryColor } ]} onPress={() => navigation.navigate('CreateWallet')} >Create new wallet here</Text>
                </Text>
            </View>
        </View>
    )
}

export default ImportWallet