import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {ThemeContext} from '../../App';
import {styles} from './style';

const SettingScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Text style={[styles.headline, {color: theme.textColor}]}>Setting</Text>
      <TouchableOpacity
        style={styles.settingItemContainer}
        onPress={() => navigation.navigate('AddressBook')}>
        <Icon name="address-book-o" size={30} color={theme.textColor} />
        <Text style={[styles.settingTitle, {color: theme.textColor}]}>
          Address book
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItemContainer}>
        <Icon name="bell-o" size={30} color={theme.textColor} />
        <Text style={[styles.settingTitle, {color: theme.textColor}]}>
          Notification setting
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export default SettingScreen;
