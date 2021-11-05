import React from 'react';
import {
    ActivityIndicator,
    StyleProp,

    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomText from '../Text';
import { styles } from './style';

const IconButton = ({
  name,
  size,
  color,
  onPress,
  badge = 0,
  style,
  disabled = false,
  loading = false,
}: IconButtonProps & {style?: StyleProp<ViewStyle>}) => {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={style}>
      {loading && <ActivityIndicator color={color} />}
      {!loading && <Icon name={name} size={size} color={color} />}
      {!loading && badge !== 0 && badge !== '0' && (
        <View style={styles.badgeContainer}>
          <CustomText style={styles.badgeText}>{badge}</CustomText>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default IconButton;
