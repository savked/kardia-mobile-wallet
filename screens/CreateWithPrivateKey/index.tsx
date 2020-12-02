import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react'
import { Text, View } from 'react-native';
import Button from '../../components/Button';
import { styles } from './style';
import { useRecoilState } from 'recoil';
import { walletsAtom } from '../../atoms/wallets';
import { saveWallets } from '../../utils/local';
import { generateWallet } from '../../utils/blockchain';
import { ThemeContext } from '../../App';

const CreateWithPrivateKey = () => {
    const navigation = useNavigation()
    const theme = useContext(ThemeContext);
    const [wallets, setWallets] = useRecoilState(walletsAtom)

    const handleGenerate = () => {
        const newWallet = generateWallet();
        const _wallets: Wallet[] = JSON.parse(JSON.stringify(wallets))
        _wallets.push(newWallet)
        saveWallets(_wallets)
        setWallets(_wallets)
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor } ]}>
            <Text style={[styles.title, { color: theme.textColor } ]}>Create with private key</Text>
            <Text style={[styles.description, styles.paragraph, { color: theme.textColor }]}>
                A unique private key will be generate for you. 
                <Text style={{fontWeight: 'bold'}}>REMEMBER</Text> to save your <Text style={{fontWeight: 'bold'}}>PRIVATE KEY</Text> ! If you lose your private key, you will not be able to recover your wallet
            </Text>
            <View style={styles.buttonGroupContainer}>
                <Button title="I understand" onPress={handleGenerate} style={{marginBottom: 12}} />
                <Button title="Cancel" type="outline" onPress={() => navigation.goBack()} />
            </View>
        </View>
    )
}

export default CreateWithPrivateKey;