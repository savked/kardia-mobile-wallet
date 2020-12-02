import React, { useContext, useEffect, useState } from 'react'
import { Text, View } from 'react-native';
import TextInput from '../../components/TextInput';
import { styles } from './style'
import Button from '../../components/Button';
import { generateMnemonic, getWalletFromMnemonic } from '../../utils/blockchain';
import AlertModal from '../../components/AlertModal';
import { useRecoilState } from 'recoil';
import { walletsAtom } from '../../atoms/wallets';
import { saveWallets } from '../../utils/local';
import { ThemeContext } from '../../App';

const CreateWithMnemonicPhrase = () => {
    const theme = useContext(ThemeContext);
    const [mnemonic, setMnemonic] = useState('')
    const [mnemonicError, setMnemonicError] = useState('')
    const [wallets, setWallets] = useRecoilState(walletsAtom)

    useEffect(() => {
        const mn = generateMnemonic();
        setMnemonic(mn)
    }, [])

    const handleAccess = async () => {
        const newWallet = await getWalletFromMnemonic(mnemonic)
        if (!newWallet) {
            setMnemonicError('Error happen!')
            return;
        }
        const _wallets: Wallet[] = JSON.parse(JSON.stringify(wallets))
        _wallets.push(newWallet as Wallet)
        setWallets(_wallets)
        saveWallets(_wallets)
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor } ]}>
            <Text style={[styles.title, { color: theme.textColor } ]}>Mnemonic phrase</Text>
            <TextInput
                multiline={true}
                numberOfLines={5}
                value={mnemonic}
                editable={false}
            />
            <Text style={[styles.description, styles.paragraph, { color: theme.textColor }]}>
                Please make sure you 
                <Text style={{fontWeight: 'bold'}}> WRITE DOWN</Text> and <Text style={{fontWeight: 'bold'}}>SAVE</Text> your mnemonic phrase. You will need it to access your wallet.
            </Text>
            <Button
                type="primary"
                title="Understood. Access my wallet now"
                onPress={handleAccess}
                size="large"
                style={{
                    width: '100%'
                }}
            />
            {
                mnemonicError !== '' && 
                <AlertModal
                    type="error"
                    visible={mnemonicError !== ''}
                    onClose={() => setMnemonicError('')}
                    message={mnemonicError}
                />
            }
        </View>
    )
}

export default CreateWithMnemonicPhrase;