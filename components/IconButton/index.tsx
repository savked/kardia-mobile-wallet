import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './style';

const IconButton = ({
  name,
  size,
  color,
  onPress,
  badge = 0,
}: IconButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon name={name} size={size} color={color} />
      {badge !== 0 && badge !== '0' && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default IconButton;
