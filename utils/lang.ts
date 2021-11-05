import US_LOCALE from 'date-fns/locale/en-US';
import VI_LOCALE from 'date-fns/locale/vi';
import { lang } from '../lang';
import { getErrorKey } from './error';

export const getSupportedLanguage = (): Partial<Language>[] => {
  return Object.values(lang).map((item) => ({
    name: item.name,
    flag: item.flag,
    key: item.key,
    tag: item.tag,
  }));
};

export const getLanguageString = (langKey: string, key: string) => {
  if (!(lang as Record<string, any>)[langKey]) {
    return key;
  }
  const langObj = (lang as Record<string, any>)[langKey] as Language;
  if (!langObj.mapping[key]) {
    return key;
  }
  return langObj.mapping[key];
};

export const getLanguageName = (langKey: string) => {
  if (!(lang as Record<string, any>)[langKey]) {
    return langKey;
  }
  const langObj = (lang as Record<string, any>)[langKey] as Language;
  return langObj.name;
};

export const getDateFNSLocale = (langKey: string) => {
  switch (langKey) {
    case 'en_US':
      return US_LOCALE;
    case 'vi_VI':
      return VI_LOCALE;
    default:
      return US_LOCALE;
  }
};

export const getDateTimeFormat = (langKey: string) => {
  if (!(lang as Record<string, any>)[langKey]) {
    return '';
  }
  const langObj = (lang as Record<string, any>)[langKey] as Language;
  return langObj.dateTimeFormat;
};

export const parseError = (errorMessage: string, langKey: string) => {
  if (!(lang as Record<string, any>)[langKey]) {
    return errorMessage;
  }
  const langObj = (lang as Record<string, any>)[langKey] as Language;
  const key = getErrorKey(errorMessage);
  if (!langObj.mapping[key]) {
    return key;
  }
  return langObj.mapping[key];
};

export const parseCardAvatar = (cardAvatarID: number) => {
  const cardAvatar = require('../assets/card_background.png');
  const cardAvatar1 = require('../assets/card_background_1.png');
  const cardAvatar2 = require('../assets/card_background_2.png');
  const cardAvatar3 = require('../assets/card_background_3.png');
  const cardAvatar4 = require('../assets/card_background_4.png');
  const cardAvatar5 = require('../assets/card_background_5.png');
  switch (cardAvatarID) {
    case 1:
      return cardAvatar1;
    case 2:
      return cardAvatar2;
    case 3:
      return cardAvatar3;
    case 4:
      return cardAvatar4;
    case 5:
      return cardAvatar5;
    default:
      return cardAvatar;
  }
};

export const parseCardAvatarColor = (cardAvatarID: number) => {
  switch (cardAvatarID) {
    case 1:
      return 'Blue Ocean';
    case 2:
      return 'Purple Night';
    case 3:
      return 'Mystery';
    case 4:
      return 'Gold';
    case 5:
      return 'Violet';
    default:
      return 'Dark Galaxy';
  }
};
