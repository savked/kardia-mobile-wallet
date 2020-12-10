import React from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Image,
  View,
  TouchableOpacity,
  ImageURISource,
  Alert,
} from 'react-native';
import styles from './style';

const CustomImagePicker = ({
  image,
  onSelect,
  pickerTitle = 'Choose image',
}: {
  image: ImageURISource;
  onSelect?: (image: ImageURISource) => void;
  pickerTitle?: string;
}) => {
  const pickImage = () => {
    Alert.alert(pickerTitle, '', [
      {
        text: 'Take picture...',
        onPress: () =>
          launchCamera({mediaType: 'photo'}, (response) => {
            const source = {uri: response.uri};
            onSelect && onSelect(source);
          }),
      },
      {
        text: 'Choose from library',
        onPress: () =>
          launchImageLibrary({mediaType: 'photo'}, (response) => {
            const source = {uri: response.uri};
            onSelect && onSelect(source);
          }),
      },
    ]);
  };

  if (image.uri) {
    return (
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={image} />
      </View>
    );
  }
  return (
    <View>
      <TouchableOpacity style={styles.newImageContainer} onPress={pickImage}>
        <MCIcon name="image-plus" color={'#DADADA'} size={32} />
      </TouchableOpacity>
    </View>
  );
};

export default CustomImagePicker;
