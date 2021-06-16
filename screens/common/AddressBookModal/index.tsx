/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react';
import {TouchableOpacity, View} from 'react-native';
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
import { ThemeContext } from '../../../ThemeContext';
import CustomImagePicker from '../../../components/ImagePicker';

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
  const theme = useContext(ThemeContext)
  return (
    <Modal 
      visible={visible} 
      showCloseButton={false}
      onClose={onClose} 
      contentStyle={{
        paddingHorizontal: 0,
        height: 500,
        backgroundColor: theme.backgroundFocusColor
      }}
    >
      <CustomText style={{color: theme.textColor, fontSize: 15}}>{getLanguageString(language, 'SELECT_ADDRESS')}</CustomText>
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
                  <CustomImagePicker image={{uri: _address.avatar}} editable={false} imageStyle={{width: 50, height: 50, borderRadius: 8}} />
                ) : (
                  <TextAvatar text={_address.name} />
                )}
              </View>
              <View>
                <CustomText style={[styles.addressName, {color: theme.textColor}]}>
                  {_address.name}
                </CustomText>
                <CustomText style={[styles.addressHash, {color: theme.textColor}]}>
                  {truncate(_address.address, 20, 20)}
                </CustomText>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <CustomText style={[styles.emptyAddressBook, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_SAVED_ADDRESS')}
          </CustomText>
        }
      />
    </Modal>
  );
};

export default AddressBookModal;
