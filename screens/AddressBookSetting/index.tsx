import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useRecoilValue} from 'recoil';
import {ThemeContext} from '../../App';
import {addressBookAtom} from '../../atoms/addressBook';
import List from '../../components/List';
import TextAvatar from '../../components/TextAvatar';
import {truncate} from '../../utils/string';
import {styles} from './style';

const AddressBookSetting = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const addressBook = useRecoilValue(addressBookAtom);
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
              <View style={styles.addressAvatarContainer}>
                {address.avatar ? (
                  <Image source={{uri: address.avatar}} />
                ) : (
                  <TextAvatar text={address.name} />
                )}
              </View>
              <View>
                <Text style={[styles.addressName, {color: theme.textColor}]}>
                  {address.name}
                </Text>
                <Text style={[styles.addressHash, {color: theme.textColor}]}>
                  {truncate(address.address, 20, 20)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyAddressBook, {color: theme.textColor}]}>
            No saved address
          </Text>
        }
      />
    </View>
  );
};

export default AddressBookSetting;
