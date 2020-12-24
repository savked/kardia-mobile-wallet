import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useRecoilValue} from 'recoil';
import {ThemeContext} from '../../App';
import {languageAtom} from '../../atoms/language';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';

const SettingScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  const language = useRecoilValue(languageAtom);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.header}>
        <Text style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'SETTING_SCREEN_TITLE')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('AddressBook')}>
        <Icon name="address-book-o" size={30} color={theme.textColor} />
        <Text style={[styles.settingTitle, {color: theme.textColor}]}>
          {getLanguageString(language, 'ADDRESS_BOOK_MENU')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('LanguageSetting')}>
        <Icon name="language" size={30} color={theme.textColor} />
        <Text style={[styles.settingTitle, {color: theme.textColor}]}>
          {getLanguageString(language, 'LANGUAGE_MENU')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('MnemonicPhraseSetting')}>
        <Icon name="lock" size={30} color={theme.textColor} />
        <Text style={[styles.settingTitle, {color: theme.textColor}]}>
          {getLanguageString(language, 'SECRET_PHRASE_MENU')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
export default SettingScreen;
