/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {HeaderBackButton} from '@react-navigation/stack';
import SettingScreen from './screens/Setting';
import AddressBookSetting from './screens/AddressBookSetting';
import {ThemeContext} from './ThemeContext';
import IconButton from './components/IconButton';
import {View} from 'react-native';
import NewAddress from './screens/NewAddress';
import {useNavigation} from '@react-navigation/native';
import AddressDetail from './screens/AddressDetail';
import LanguageSetting from './screens/LanguageSetting';
import {useRecoilValue} from 'recoil';
import {languageAtom} from './atoms/language';
import {getLanguageString} from './utils/lang';
import MnemonicPhraseSetting from './screens/MnemonicPhraseSetting';
import SettingPasscode from './screens/SettingPasscode';

const SettingStack = createStackNavigator();

const SettingStackScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  return (
    <SettingStack.Navigator
      initialRouteName="Setting"
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          shadowColor: 'transparent',
          backgroundColor: theme.backgroundColor,
        },
        headerBackTitleVisible: false,
      }}>
      <SettingStack.Screen
        name="Setting"
        component={SettingScreen}
        options={{headerShown: false}}
      />
      <SettingStack.Screen
        name="AddressBook"
        component={AddressBookSetting}
        options={{
          title: getLanguageString(language, 'ADDRESS_BOOK_MENU'),
          headerTitleStyle: {
            color: theme.textColor,
          },
          headerTintColor: theme.textColor,
          headerRight: () => {
            return (
              <View style={{paddingRight: 12}}>
                <IconButton
                  name="plus"
                  size={20}
                  color={theme.textColor}
                  onPress={() => {
                    navigation.navigate('NewAddress');
                  }}
                />
              </View>
            );
          },
        }}
      />
      <SettingStack.Screen
        name="NewAddress"
        component={NewAddress}
        options={{
          title: 'New address',
          headerTitleStyle: {
            color: theme.textColor,
          },
          headerTintColor: theme.textColor,
        }}
      />
      <SettingStack.Screen
        name="AddressDetail"
        component={AddressDetail}
        options={{
          title: 'Detail',
          headerTitleStyle: {
            color: theme.textColor,
          },
          headerTintColor: theme.textColor,
        }}
      />
      <SettingStack.Screen
        name="LanguageSetting"
        component={LanguageSetting}
        options={{
          title: getLanguageString(language, 'LANGUAGE_SETTING_TITLE'),
          headerTitleStyle: {
            color: theme.textColor,
          },
          headerTintColor: theme.textColor,
        }}
      />
      <SettingStack.Screen
        name="MnemonicPhraseSetting"
        component={MnemonicPhraseSetting}
        options={({navigation: _navigation, route}) => {
          return {
            title: getLanguageString(language, 'MNEMONIC_SETTING_TITLE'),
            headerTitleStyle: {
              color: theme.textColor,
            },
            headerTintColor: theme.textColor,
            headerLeft: () => {
              if (route.params && (route.params as any).from === 'Home') {
                return (
                  <HeaderBackButton
                    tintColor={theme.textColor}
                    onPress={() => {
                      _navigation.reset({
                        index: 0,
                        routes: [{name: 'Home'}],
                      });
                    }}
                  />
                );
              }
              return <HeaderBackButton tintColor={theme.textColor} />;
            },
          };
        }}
      />
      <SettingStack.Screen
        name="SettingPasscode"
        component={SettingPasscode}
        options={{
          title: getLanguageString(language, 'PASSCODE_SETTING_TITLE'),
          headerTitleStyle: {
            color: theme.textColor,
          },
          headerTintColor: theme.textColor,
        }}
      />
    </SettingStack.Navigator>
  );
};

export default SettingStackScreen;
