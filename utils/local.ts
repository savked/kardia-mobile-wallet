import AsyncStorage from '@react-native-async-storage/async-storage';

export const getWallets = async () => {
  try {
    const value = await AsyncStorage.getItem('@kardia_wallets');
    if (value !== null) {
      // value previously stored
      const wallets = JSON.parse(value);
      if (!Array.isArray(wallets)) {
        console.error('Invalid local data');
        return [];
      }
      return wallets;
    }
    return [];
  } catch (e) {
    console.error(e);
    return [];
    // error reading value
  }
};

export const saveWallets = async (wallets: Wallet[]) => {
  try {
    await AsyncStorage.setItem('@kardia_wallets', JSON.stringify(wallets));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const clearLocalWallets = async () => {
  try {
    await AsyncStorage.removeItem('@kardia_wallets');
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
