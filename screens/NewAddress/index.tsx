import React, {useContext, useState} from 'react';
import {ImageURISource, View} from 'react-native';
import {ThemeContext} from '../../App';
import CustomImagePicker from '../../components/ImagePicker';
import TextInput from '../../components/TextInput';
import {styles} from './style';

const NewAddress = () => {
  const theme = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<ImageURISource>({uri: ''});
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
    </View>
  );
};

export default NewAddress;
