import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ThemeContext} from '../../ThemeContext';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import CustomImagePicker from '../../components/ImagePicker';
import TextInput from '../../components/TextInput';
import {getLanguageString} from '../../utils/lang';
import {saveAddressBook} from '../../utils/local';
import {styles} from './style';

const AddressDetail = () => {
  const {params} = useRoute();
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const addressHash = params ? (params as any).addressHash : '';
  const [addressBook, setAddressBook] = useRecoilState(addressBookAtom);
  const [addressData, setAddressData] = useState<Address>();
  const language = useRecoilValue(languageAtom);

  const removeAddress = () => {
    Alert.alert('', 'Are you sure you want to delete this address ?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: "Yes I'm sure",
        onPress: () => {
          const _addressBook: Address[] = JSON.parse(
            JSON.stringify(addressBook),
          );
          setAddressBook(
            _addressBook.filter((item) => item.address !== addressHash),
          );
          saveAddressBook(
            _addressBook.filter((item) => item.address !== addressHash),
          );
          navigation.goBack();
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.removeButtonContainer}
          onPress={removeAddress}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    const addressItem = addressBook.find(
      (item) => item.address === addressHash,
    );
    if (!addressItem) {
      return;
    }
    const _addressData: Address = JSON.parse(JSON.stringify(addressItem));
    setAddressData(_addressData);
  }, [addressHash, addressBook]);

  if (!addressData) {
    return (
      <View>
        <Text>Invalid address</Text>
      </View>
    );
  }

  const updateAddressData = (field: string, value: any) => {
    const newData = JSON.parse(JSON.stringify(addressData));
    newData[field] = value;
    setAddressData(newData);
  };

  const saveAddress = () => {
    const _addressBook: Address[] = JSON.parse(JSON.stringify(addressBook));
    _addressBook.forEach((item, index) => {
      if (item.address === addressHash) {
        _addressBook[index] = addressData;
      }
    });
    setAddressBook(_addressBook);
    saveAddressBook(_addressBook);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.avatarPickerContainer}>
        <CustomImagePicker
          image={{uri: addressData.avatar}}
          onSelect={(image) => {
            updateAddressData('avatar', image.uri);
          }}
        />
      </View>
      <View style={styles.formFieldContainer}>
        <TextInput
          headline={getLanguageString(language, 'ADDRESS_NAME')}
          block
          value={addressData.name}
          onChangeText={(newValue) => updateAddressData('name', newValue)}
        />
      </View>
      <View style={styles.formFieldContainer}>
        <TextInput
          headline={getLanguageString(language, 'ADDRESS_ADDRESS')}
          block
          value={addressData.address}
          onChangeText={(newValue) => updateAddressData('address', newValue)}
        />
      </View>
      <View style={styles.buttonGroupContainer}>
        <Button
          title={getLanguageString(language, 'SAVE')}
          type="primary"
          onPress={saveAddress}
          style={styles.button}
        />
        <Button
          title={getLanguageString(language, 'GO_BACK')}
          type="outline"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
      </View>
    </View>
  );
};

export default AddressDetail;
