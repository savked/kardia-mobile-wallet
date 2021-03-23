/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {useRecoilValue} from 'recoil';
import {ThemeContext} from '../../ThemeContext';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import CustomImagePicker from '../../components/ImagePicker';
import AntIcon from 'react-native-vector-icons/AntDesign';
import List from '../../components/List';
import TextAvatar from '../../components/TextAvatar';
import {getLanguageString} from '../../utils/lang';
import {truncate} from '../../utils/string';
import {styles} from './style';
import Button from '../../components/Button';

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
        containerStyle={{flex: 1}}
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
          <View style={styles.noAddressContainer}>
            <Image
              style={{width: 170, height: 156, marginBottom: 23}}
              source={require('../../assets/no_address_dark.png')}
            />
            <Text style={[styles.emptyAddressBook, {color: theme.textColor}]}>
              {getLanguageString(language, 'NO_SAVED_ADDRESS')}
            </Text>
            <Button
              type="primary"
              onPress={() => navigation.navigate('NewAddress')}
              title={getLanguageString(language, 'ADD_NEW_ADDRESS')}
              block={true}
              icon={
                <AntIcon
                  name="plus"
                  size={20}
                  color={'#000000'}
                  style={{marginRight: 8}}
                />
              }
            />
          </View>
        }
      />
    </View>
  );
};

export default AddressBookSetting;
