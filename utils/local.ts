import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

export const getWallets = async () => {
  try {
    const value = await AsyncStorage.getItem('@kardia_wallets');
    if (value !== null) {
      // value previously stored
      const wallets = JSON.parse(value);
      if (!Array.isArray(wallets)) {
        Sentry.captureMessage('Invalid local data');
        return [];
      }
      return wallets;
    }
    return [];
  } catch (e) {
    Sentry.captureException(e);
    return [];
    // error reading value
  }
};

export const saveWallets = async (wallets: Wallet[]) => {
  try {
    await AsyncStorage.setItem('@kardia_wallets', JSON.stringify(wallets));
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
};

export const clearLocalWallets = async () => {
  try {
    await AsyncStorage.removeItem('@kardia_wallets');
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
};

export const saveAddressBook = async (addressBook: Address[]) => {
  try {
    await AsyncStorage.setItem(
      '@kardia_address_book',
      JSON.stringify(addressBook),
    );
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
};

export const getAddressBook = async () => {
  try {
    const value = await AsyncStorage.getItem('@kardia_address_book');
    if (value !== null) {
      // value previously stored
      const addressBook = JSON.parse(value);
      if (!Array.isArray(addressBook)) {
        Sentry.captureMessage('Invalid local data');
        return [];
      }
      return addressBook;
    }
    return [];
  } catch (e) {
    Sentry.captureException(e);
    return [];
    // error reading value
  }
};

export const saveLanguageSetting = async (lang: string) => {
  try {
    await AsyncStorage.setItem('@kardia_language_setting', lang);
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
};

export const getLanguageSetting = async () => {
  try {
    const value = await AsyncStorage.getItem('@kardia_language_setting');
    if (value !== null) {
      return value;
    }
    return '';
  } catch (e) {
    Sentry.captureException(e);
    return '';
    // error reading value
  }
};

export const saveMnemonic = async (mnemonic: string) => {
  try {
    await AsyncStorage.setItem('@kardia_mnemonic', mnemonic);
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
};

export const getMnemonic = async () => {
  try {
    const value = await AsyncStorage.getItem('@kardia_mnemonic');
    if (value !== null) {
      return value;
    }
    return '';
  } catch (e) {
    Sentry.captureException(e);
    return '';
    // error reading value
  }
};
