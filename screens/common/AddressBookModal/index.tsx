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
import CustomText from '../../../components/Text';

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
    <Modal 
      visible={visible} 
      onClose={onClose} 
      contentStyle={{
        paddingHorizontal: 0,
        flex: 0.65,
      }}
    >
      <CustomText>{getLanguageString(language, 'SELECT_ADDRESS')}</CustomText>
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
                <CustomText style={[styles.addressName, {color: '#000000'}]}>
                  {_address.name}
                </CustomText>
                <CustomText style={[styles.addressHash, {color: '#000000'}]}>
                  {truncate(_address.address, 20, 20)}
                </CustomText>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <CustomText style={[styles.emptyAddressBook]}>
            {getLanguageString(language, 'NO_SAVED_ADDRESS')}
          </CustomText>
        }
      />
    </Modal>
  );
};

export default AddressBookModal;
