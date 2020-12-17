import {lang} from '../lang';
import US_LOCALE from 'date-fns/locale/en-US';
import VI_LOCALE from 'date-fns/locale/vi';

export const getSupportedLanguage = (): Partial<Language>[] => {
  return Object.values(lang).map((item) => ({
    name: item.name,
    flag: item.flag,
    key: item.key,
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
