/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useRecoilValue} from 'recoil';
import {ThemeContext} from '../../App';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import CustomImagePicker from '../../components/ImagePicker';
import List from '../../components/List';
import TextAvatar from '../../components/TextAvatar';
import {getLanguageString} from '../../utils/lang';
import {truncate} from '../../utils/string';
import {styles} from './style';

const AddressBookSetting = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const addressBook = useRecoilValue(addressBookAtom);
  const language = useRecoilValue(languageAtom);
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <List
        items={addressBook}
        keyExtractor={(item) => item.address}
        render={(address: Address) => {
          return (
            <TouchableOpacity
              style={styles.addressContainer}
              onPress={() =>
                navigation.navigate('AddressDetail', {
                  addressHash: address.address,
                })
              }>
              {address.avatar ? (
                <CustomImagePicker
                  image={{uri: address.avatar}}
                  editable={false}
                  style={styles.addressAvatarContainer}
                  imageStyle={styles.addressAvatar}
                />
              ) : (
                <TextAvatar
                  text={address.name}
                  size={60}
                  style={{marginRight: 12}}
                />
              )}
              <View>
                <Text style={[styles.addressName, {color: theme.textColor}]}>
                  {address.name}
                </Text>
                <Text style={[styles.addressHash, {color: theme.textColor}]}>
                  {truncate(address.address, 15, 15)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyAddressBook, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_SAVED_ADDRESS')}
          </Text>
        }
      />
    </View>
  );
};

export default AddressBookSetting;
