import {atom} from 'recoil';
import {NativeModules, Platform} from 'react-native';
import {getSupportedLanguage} from '../utils/lang';
import * as Sentry from '@sentry/react-native';

let deviceLanguage = 'en_US';

const _deviceLanguage =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier;

const supportedLanguage = getSupportedLanguage();
let isSupported = false;
supportedLanguage.forEach((item) => {
  if (item.tag?.includes(_deviceLanguage)) {
    deviceLanguage = item.key!;
    isSupported = true;
  }
});

if (!isSupported) {
  Sentry.captureMessage(`Not supported language key: ${_deviceLanguage}`);
}

export const languageAtom = atom({
  key: 'languageAtom', // unique ID (with respect to other atoms/selectors)
  default: deviceLanguage, // default value (aka initial value)
});
