import {atom} from 'recoil';
import {NativeModules, Platform} from 'react-native';

let deviceLanguage =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier;

if (deviceLanguage === 'en') {
  deviceLanguage = 'en_US'
}

export const languageAtom = atom({
  key: 'languageAtom', // unique ID (with respect to other atoms/selectors)
  default: deviceLanguage, // default value (aka initial value)
});
