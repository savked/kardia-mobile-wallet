import AsyncStorage from '@react-native-async-storage/async-storage';

const fakeWallets = [
    {
        address: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
        balance: 123
    },
    {
        address: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
        balance: 456
    }
]

export const getWallets = async () => {
    // return fakeWallets
    try {
        const value = await AsyncStorage.getItem('@kardia_wallets')
        if (value !== null) {
            // value previously stored
            const wallets = JSON.parse(value)
            if (!Array.isArray(wallets)) {
                console.error('Invalid local data')
                return []
            }
            return wallets
        }
        return []
    } catch (e) {
        console.error(e)
        return []
        // error reading value
    }
}

export const saveWallets = async (wallets: Wallet[]) => {
    try {
        await AsyncStorage.setItem('@kardia_wallets', JSON.stringify(wallets))
        return true
    } catch (e) {
        console.error(e)
        return false
    }
}