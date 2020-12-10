import React, {useContext} from 'react';
import {View, Text, Image} from 'react-native';
import {useRecoilValue} from 'recoil';
import {ThemeContext} from '../../App';
import {addressBookAtom} from '../../atoms/addressBook';
import List from '../../components/List';
import TextAvatar from '../../components/TextAvatar';
import {truncate} from '../../utils/string';
import {styles} from './style';

const AddressBookSetting = () => {
  const theme = useContext(ThemeContext);
  const addressBook = useRecoilValue(addressBookAtom);
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <List
        items={addressBook}
        keyExtractor={(item) => item.address}
        render={(address: Address) => {
          return (
            <View style={styles.addressContainer}>
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
            </View>
          );
        }}
      />
    </View>
  );
};

export default AddressBookSetting;
