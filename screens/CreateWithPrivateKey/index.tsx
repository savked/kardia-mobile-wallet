import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { Text, View } from 'react-native';
import Button from '../../components/Button';
import { styles } from './style';
import { useRecoilState } from 'recoil';
import { walletsAtom } from '../../atoms/wallets';
import { saveWallets } from '../../utils/local';
import { generateWallet } from '../../utils/blockchain';

const CreateWithPrivateKey = () => {
    const navigation = useNavigation()
    const [wallets, setWallets] = useRecoilState(walletsAtom)

    const handleGenerate = () => {
        const newWallet = generateWallet();
        const _wallets: Wallet[] = JSON.parse(JSON.stringify(wallets))
        _wallets.push(newWallet)
        saveWallets(_wallets)
        setWallets(_wallets)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create with private key</Text>
            <Text style={[styles.description, styles.paragraph]}>
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