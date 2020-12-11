import {useNavigation} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {ImageURISource, View} from 'react-native';
import {useRecoilState} from 'recoil';
import {ThemeContext} from '../../App';
import {addressBookAtom} from '../../atoms/addressBook';
import Button from '../../components/Button';
import CustomImagePicker from '../../components/ImagePicker';
import TextInput from '../../components/TextInput';
import {saveAddressBook} from '../../utils/local';
import {styles} from './style';

const NewAddress = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<ImageURISource>({uri: ''});
  const [addressBook, setAddressBook] = useRecoilState(addressBookAtom);

  const saveAddress = async () => {
    const currentAB: Address[] = JSON.parse(JSON.stringify(addressBook));
    currentAB.push({
      address,
      name,
      avatar: avatar.uri ? avatar.uri : '',
    });
    setAddressBook(currentAB);
    saveAddressBook(currentAB);
    navigation.navigate('AddressBook');
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.avatarPickerContainer}>
        <CustomImagePicker image={avatar} onSelect={setAvatar} />
      </View>
      <View style={styles.formFieldContainer}>
        <TextInput headline="Name" block value={name} onChangeText={setName} />
      </View>
      <View style={styles.formFieldContainer}>
        <TextInput
          headline="Address"
          block
          value={address}
          onChangeText={setAddress}
        />
      </View>
      <Button
        title="Save"
        type="primary"
        onPress={saveAddress}
        style={styles.saveButton}
      />
    </View>
  );
};

export default NewAddress;
