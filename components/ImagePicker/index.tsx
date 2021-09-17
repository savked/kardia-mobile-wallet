import React, { useContext } from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  Image,
  TouchableOpacity,
  ImageURISource,
  Alert,
  ViewStyle,
  StyleProp,
  ImageStyle,
  View,
} from 'react-native';
import styles from './style';
import { getLanguageString } from '../../utils/lang';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { ThemeContext } from '../../ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

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
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom);
  const pickImage = () => {
    Alert.alert(pickerTitle, '', [
      {
        text: getLanguageString(language, 'TAKE_PICTURE'),
        onPress: () =>
          launchCamera({mediaType: 'photo', durationLimit: 120, includeBase64: true}, (response) => {
            if (onSelect && response.base64) {
              const source = {uri: `data:image/png;base64,${response.base64}`};
              onSelect(source);
            }
          }),
      },
      {
        text: getLanguageString(language, 'CHOOSE_FROM_LIBRARY'),
        onPress: () => {
          launchImageLibrary(
            // TODO: Check for library error fixing
            // @ts-ignore
            {mediaType: 'photo', durationLimit: 120, includeBase64: true},
            (response) => {
              if (onSelect && response.base64) {
                const source = {uri: `data:image/png;base64,${response.base64}`};
                onSelect(source);
              }
            },
          );
        },
      },
      {
        text: getLanguageString(language, 'CANCEL'),
        style: "cancel",
      },
    ], {
      cancelable: true,
    });
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
      style={[styles.newImageContainer, {backgroundColor: theme.backgroundStrongColor}, style]}
      onPress={() => editable && pickImage()}>
      <Image 
        source={require('../../assets/icon/user_dark.png')}
        style={{
          width: 32,
          height: 32
        }}
      />
      <LinearGradient
        start={{x: 0, y: 0}}
        locations={[0, 0.5]}
        end={{x: 1, y: 1}}
        colors={[
          'rgba(91, 141, 239, 1)',
          'rgba(0, 99, 247, 1)',
        ]}
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(91, 141, 239, 1)',
          padding: 7,
          borderRadius: 8,
          right: -8,
          bottom: 0
        }}
      >
        <FeatherIcon name="camera" color="#FFFFFF" size={15} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CustomImagePicker;
