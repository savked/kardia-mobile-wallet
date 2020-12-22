import {useNavigation} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {ImageURISource, Text, View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
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
  const [showModal, setShowModal] = useState(false);

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

  const showQRScanner = () => {
    setShowModal(true);
  };

  if (showModal) {
    return (
      <>
        <View style={styles.qrScannerHeader}>
          <Text style={styles.centerText}>Scan address QR code</Text>
        </View>
        <QRCodeScanner
          onRead={(e) => {
            setAddress(e.data);
            setShowModal(false);
          }}
          showMarker={true}
        />
        <View style={styles.qrScannerFooter}>
          <Button
            size="large"
            title="Cancel"
            onPress={() => setShowModal(false)}
          />
        </View>
      </>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.avatarPickerContainer}>
        <CustomImagePicker image={avatar} onSelect={setAvatar} />
      </View>
      <View style={styles.formFieldContainer} removeClippedSubviews={true}>
        <TextInput headline="Name" block value={name} onChangeText={setName} />
      </View>
      <View style={styles.formFieldContainer} removeClippedSubviews={true}>
        <TextInput
          headline="Address"
          block
          value={address}
          onChangeText={setAddress}
          iconName="qrcode"
          onIconPress={showQRScanner}
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
