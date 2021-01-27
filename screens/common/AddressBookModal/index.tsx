/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {addressBookAtom} from '../../../atoms/addressBook';
import {styles} from './style';
import List from '../../../components/List';
import Modal from '../../../components/Modal';
import {truncate} from '../../../utils/string';
import TextAvatar from '../../../components/TextAvatar';
import {languageAtom} from '../../../atoms/language';
import {getLanguageString} from '../../../utils/lang';

const AddressBookModal = ({
  visible,
  onClose,
  onSelectAddress,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: string) => void;
}) => {
  const addressBook = useRecoilValue(addressBookAtom);
  const language = useRecoilValue(languageAtom);
  return (
    <Modal full visible={visible} onClose={onClose}>
      <Text>{getLanguageString(language, 'SELECT_ADDRESS')}</Text>
      <List
        items={addressBook}
        keyExtractor={(item) => item.address}
        render={(_address: Address) => {
          return (
            <TouchableOpacity
              style={styles.addressContainer}
              onPress={() => {
                onSelectAddress(_address.address);
              }}>
              <View style={styles.addressAvatarContainer}>
                {_address.avatar ? (
                  <Image source={{uri: _address.avatar}} />
                ) : (
                  <TextAvatar text={_address.name} />
                )}
              </View>
              <View>
                <Text style={[styles.addressName, {color: '#000000'}]}>
                  {_address.name}
                </Text>
                <Text style={[styles.addressHash, {color: '#000000'}]}>
                  {truncate(_address.address, 20, 20)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyAddressBook]}>
            {getLanguageString(language, 'NO_SAVED_ADDRESS')}
          </Text>
        }
      />
    </Modal>
  );
};

export default AddressBookModal;
