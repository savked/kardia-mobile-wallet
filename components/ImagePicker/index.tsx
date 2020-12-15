import React from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Image,
  TouchableOpacity,
  ImageURISource,
  Alert,
  ViewStyle,
  StyleProp,
  ImageStyle,
} from 'react-native';
import styles from './style';

const CustomImagePicker = ({
  image,
  onSelect,
  pickerTitle = 'Choose image',
  editable = true,
  style,
  imageStyle,
}: {
  image: ImageURISource;
  onSelect?: (image: ImageURISource) => void;
  pickerTitle?: string;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}) => {
  const pickImage = () => {
    Alert.alert(pickerTitle, '', [
      {
        text: 'Take picture...',
        onPress: () =>
          launchCamera({mediaType: 'photo', durationLimit: 120}, (response) => {
            const source = {uri: response.uri};
            onSelect && onSelect(source);
          }),
      },
      {
        text: 'Choose from library',
        onPress: () => {
          launchImageLibrary(
            // TODO: Check for library error fixing
            // @ts-ignore
            {mediaType: 'photo', durationLimit: 120},
            (response) => {
              const source = {uri: response.uri};
              onSelect && onSelect(source);
            },
          );
        },
      },
    ]);
  };
  if (image.uri) {
    return (
      <TouchableOpacity
        style={[styles.imageContainer, style]}
        onPress={() => editable && pickImage()}>
        <Image style={[styles.image, imageStyle]} source={image} />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={[styles.newImageContainer, style]}
      onPress={() => editable && pickImage()}>
      <MCIcon name="image-plus" color={'#DADADA'} size={32} />
    </TouchableOpacity>
  );
};

export default CustomImagePicker;
