import React, { useState } from 'react'
import { View, Text, TextInput } from 'react-native'
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { useNavigation } from '@react-navigation/native';
import { styles } from './style'
import * as Bip39 from 'bip39';


const ImportMnemonic = () => {
    const navigation = useNavigation()
    const [mnemonic, setMnemonic] = useState("")
    const [error, setError] = useState("");

    function accessWalletByMnemonic() {
        setMnemonic("casino ivory topple frog afraid dose discover hybrid absent acid genuine clip basic smooth mountain expose praise fiscal magic gauge auto close spin column");
        const valid = validateSeedPhrase();
        console.log(valid);
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
        <View style={styles.container}>
            <Text style={styles.title}>Enter seed phrase</Text>
            <TextInput style={styles.input} value={mnemonic} onChangeText={setMnemonic} numberOfLines={5}
                multiline={true} />
            <ErrorMessage message={error} style={{textAlign:'left'}}/>



            <View style={styles.buttonGroup}>
                <Button size="large" type="primary" title="Import" onPress={accessWalletByMnemonic} />
                <Button size="large" type="secondary" onPress={() => navigation.goBack()} title="Cancel" />
            </View>
        </View>
    )
}

export default ImportMnemonic