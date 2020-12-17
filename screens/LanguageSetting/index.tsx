/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Flag from 'react-native-flags';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useRecoilState} from 'recoil';
import {ThemeContext} from '../../App';
import {languageAtom} from '../../atoms/language';
import List from '../../components/List';
import {getSupportedLanguage} from '../../utils/lang';
import {saveLanguageSetting} from '../../utils/local';
import {styles} from './style';

const languageList = getSupportedLanguage();

const LanguageSetting = () => {
  const theme = useContext(ThemeContext);

  const [language, setLanguage] = useRecoilState(languageAtom);

  const selectLanguage = async (lang: string) => {
    await saveLanguageSetting(lang);
    setLanguage(lang);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <List
        items={languageList}
        keyExtractor={(item) => item.flag}
        render={(item: Partial<Language>) => {
          const active = language === item.key;
          return (
            <TouchableOpacity
              style={styles.languageItem}
              onPress={() => selectLanguage(item.key || '')}>
              <View style={styles.itemContainer}>
                <Flag code={item.flag} size={48} style={{marginRight: 14}} />
                <Text style={{color: theme.textColor}}>{item.name}</Text>
              </View>
              <View>
                {active && (
                  <Icon name="check" size={18} color={theme.textColor} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default LanguageSetting;
