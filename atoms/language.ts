import { NativeModules, Platform } from 'react-native';
import { atom } from 'recoil';
import { getSupportedLanguage } from '../utils/lang';

let deviceLanguage = 'en_US';

const _deviceLanguage =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier;

const supportedLanguage = getSupportedLanguage();
supportedLanguage.forEach((item) => {
  if (item.tag?.includes(_deviceLanguage)) {
    deviceLanguage = item.key!;
  }
});

export const languageAtom = atom({
  key: 'languageAtom', // unique ID (with respect to other atoms/selectors)
  default: deviceLanguage, // default value (aka initial value)
});
