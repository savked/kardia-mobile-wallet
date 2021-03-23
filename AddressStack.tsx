/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import AddressBookSetting from './screens/AddressBookSetting';
import {ThemeContext} from './ThemeContext';
import IconButton from './components/IconButton';
import {View} from 'react-native';
import NewAddress from './screens/NewAddress';
import {useNavigation} from '@react-navigation/native';
import AddressDetail from './screens/AddressDetail';
import {useRecoilValue} from 'recoil';
import {languageAtom} from './atoms/language';
import {getLanguageString} from './utils/lang';

const AddressStack = createStackNavigator();

const AddressStackScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  return (
    <AddressStack.Navigator
      initialRouteName="AddressBook"
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          shadowColor: 'transparent',
          backgroundColor: theme.backgroundColor,
        },
        headerBackTitleVisible: false,
      }}>
      <AddressStack.Screen
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
              <View style={{paddingRight: 12, flexDirection: 'row'}}>
                <IconButton
                  name="bell-o"
                  size={20}
                  color={theme.textColor}
                  style={{marginRight: 20}}
                  onPress={() => {
                    navigation.navigate('Notification');
                  }}
                />
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
      <AddressStack.Screen
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
      <AddressStack.Screen
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
    </AddressStack.Navigator>
  );
};

export default AddressStackScreen;
