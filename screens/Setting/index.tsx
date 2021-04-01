/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ThemeContext} from '../../ThemeContext';
import {languageAtom} from '../../atoms/language';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';
import {showTabBarAtom} from '../../atoms/showTabBar';

const SettingScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  const language = useRecoilValue(languageAtom);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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
        <View style={{width: '10%', alignItems: 'center'}}>
          <Icon name="address-book-o" size={30} color={theme.textColor} />
        </View>
        <View style={{width: '93%'}}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'ADDRESS_BOOK_MENU')}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('LanguageSetting')}>
        <View style={{width: '10%', alignItems: 'center'}}>
          <Icon name="language" size={30} color={theme.textColor} />
        </View>
        <View style={{width: '93%'}}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'LANGUAGE_MENU')}
          </Text>
        </View>
      </TouchableOpacity>
      {/* <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('MnemonicPhraseSetting')}>
        <View style={{width: '10%', alignItems: 'center'}}>
          <Icon name="low-vision" size={27} color={theme.textColor} />
        </View>
        <View style={{width: '93%'}}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'SECRET_PHRASE_MENU')}
          </Text>
        </View>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('SettingPasscode')}>
        <View style={{width: '10%', alignItems: 'center'}}>
          <Icon name="lock" size={30} color={theme.textColor} />
        </View>
        <View style={{width: '93%'}}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'PASSCODE_MENU')}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('Info')}>
        <View style={{width: '10%', alignItems: 'center'}}>
          <Icon name="info-circle" size={30} color={theme.textColor} />
        </View>
        <View style={{width: '93%'}}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'INFO_MENU')}
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
export default SettingScreen;
