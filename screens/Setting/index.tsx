/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {View, TouchableOpacity, Image, ScrollView, Platform} from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import ENIcon from 'react-native-vector-icons/Entypo';
import IconButton from '../../components/IconButton';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ThemeContext} from '../../ThemeContext';
import {languageAtom} from '../../atoms/language';
import {getLanguageName, getLanguageString} from '../../utils/lang';
import {styles} from './style';
import {showTabBarAtom} from '../../atoms/showTabBar';
import {walletsAtom} from '../../atoms/wallets';
import CustomText from '../../components/Text';

const INFO_DATA = {
  version: '2.0.14',
};

const SettingScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  const language = useRecoilValue(languageAtom);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  const wallets = useRecoilValue(walletsAtom);

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
        <CustomText style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'SETTING_SCREEN_TITLE')}
        </CustomText>
        <IconButton
          name="bell-o"
          color={theme.textColor}
          size={20}
          onPress={() => navigation.navigate('Notification')}
        />
      </View>
      <ScrollView>
        <View style={{flex: 1}}>
          <CustomText
            style={{
              color: theme.textColor,
              marginHorizontal: 20,
              fontSize: theme.defaultFontSize,
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}>
            {getLanguageString(language, 'GENERAL_GROUP')}
          </CustomText>
          <View
            style={{
              backgroundColor: theme.backgroundFocusColor,
              marginHorizontal: 20,
              marginVertical: 8,
              padding: 16,
              borderRadius: 8,
            }}>
            <TouchableOpacity
              style={styles.settingItemContainer}
              onPress={() => navigation.navigate('LanguageSetting')}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#809CFF',
                  borderRadius: 12,
                }}>
                <Image
                  source={require('../../assets/icon/language.png')}
                  style={{width: 20, height: 20, resizeMode: 'contain'}}
                />
              </View>
              <View style={{alignItems: 'flex-start', flex: 1}}>
                <CustomText style={[styles.settingTitle, {color: theme.textColor, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}]}>
                  {getLanguageString(language, 'LANGUAGE_MENU')}
                </CustomText>
              </View>
              <CustomText style={{color: theme.mutedTextColor}}>
                {getLanguageName(language)}
              </CustomText>
              <ENIcon name="chevron-right" color={theme.textColor} size={20} />
            </TouchableOpacity>
          </View>
          <CustomText
            allowFontScaling={false}
            style={{
              color: theme.textColor,
              marginHorizontal: 20,
              fontSize: 12,
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}>
            {getLanguageString(language, 'SECURITY_GROUP')}
          </CustomText>
          <View
            style={{
              backgroundColor: theme.backgroundFocusColor,
              marginHorizontal: 20,
              marginVertical: 8,
              padding: 16,
              borderRadius: 8,
            }}>
            <TouchableOpacity
              style={styles.settingItemContainer}
              onPress={() => navigation.navigate('SettingPasscode')}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#3360FF',
                  borderRadius: 12,
                }}>
                <Image
                  source={require('../../assets/icon/passcode.png')}
                  style={{width: 20, height: 20, resizeMode: 'contain'}}
                />
              </View>
              <View style={{alignItems: 'flex-start', flex: 1}}>
                <CustomText style={[styles.settingTitle, {color: theme.textColor, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}]}>
                  {getLanguageString(language, 'PASSCODE_MENU')}
                </CustomText>
              </View>
              <ENIcon name="chevron-right" color={theme.textColor} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingItemContainer, {marginTop: 28}]}
              onPress={() => navigation.navigate('WalletManagement')}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#809CFF',
                  borderRadius: 12,
                }}>
                <Image
                  source={require('../../assets/icon/wallet_management.png')}
                  style={{width: 28, height: 28, resizeMode: 'contain'}}
                />
              </View>
              <View style={{alignItems: 'flex-start', flex: 1}}>
                <CustomText style={[styles.settingTitle, {color: theme.textColor, fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}]}>
                  {getLanguageString(language, 'WALLET_MANAGEMENT')}
                </CustomText>
              </View>
              <CustomText style={{color: theme.mutedTextColor}}>
                ({wallets.length})
              </CustomText>
              <ENIcon name="chevron-right" color={theme.textColor} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <CustomText
        style={{
          textAlign: 'center',
          color: 'rgba(252, 252, 252, 0.26)',
          fontSize: theme.defaultFontSize,
          marginBottom: 24,
        }}>
        Kardiachain©2020 - Version {INFO_DATA.version}
      </CustomText>
    </SafeAreaView>
  );
};
export default SettingScreen;
