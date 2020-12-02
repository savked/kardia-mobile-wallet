import React, { useContext, useState } from 'react'
import { View, Text, TextInput } from 'react-native'
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { useNavigation } from '@react-navigation/native';
import { styles } from './style'
import * as Bip39 from 'bip39';
import { walletsAtom } from '../../atoms/wallets';
import { saveWallets } from '../../utils/local';
import { useRecoilState } from 'recoil';
import { hdkey } from 'ethereumjs-wallet'
import CustomTextInput from '../../components/TextInput';
import { ThemeContext } from '../../App';

const ImportMnemonic = () => {
    const theme = useContext(ThemeContext);
    const navigation = useNavigation()
    const [mnemonic, setMnemonic] = useState("");
    const [error, setError] = useState("");
    const [wallets, setWallets] = useRecoilState(walletsAtom);

    async function accessWalletByMnemonic() {
        const valid = validateSeedPhrase();
        if (!valid) return;
        const seed = await Bip39.mnemonicToSeed(mnemonic.trim())
        const root = hdkey.fromMasterSeed(seed)
        const masterWallet = root.getWallet()
        const privateKey = masterWallet.getPrivateKeyString();
        const walletAddress = masterWallet.getAddressString();
        const wallet: Wallet = {
            privateKey: privateKey,
            address: walletAddress,
            balance: 0
        }

        const _wallets = JSON.parse(JSON.stringify(wallets))
        _wallets.push(wallet)

        setWallets(_wallets);
        saveWallets(_wallets);
    }

    function validateSeedPhrase() {
        if (!mnemonic) {
            setError("Field is required");
            return false;
        }
        const valid = Bip39.validateMnemonic(mnemonic);
        if (!valid) {
            setError("Seed phrase wrong format");
            return false;
        }
        return true;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor } ]}>
            <Text style={[styles.title, { color: theme.textColor } ]}>Enter seed phrase</Text>
            <CustomTextInput style={styles.input} value={mnemonic} onChangeText={setMnemonic} numberOfLines={5}
                multiline={true} />
            <ErrorMessage message={error} style={{ textAlign: 'left' }} />
            <View style={styles.buttonGroup}>
                <Button size="large" type="primary" title="Import" onPress={accessWalletByMnemonic} />
                <Button size="large" type="secondary" onPress={() => navigation.goBack()} title="Cancel" />
            </View>
        </View>
    )
}

export default ImportMnemonic