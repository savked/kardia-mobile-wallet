import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import CustomText from '../Text';
import { styles } from './style';
const ListItem = ({label, onSelect}: ListItemProps) => {
  return (
    <View style={styles.listItem}>
      <TouchableOpacity onPress={onSelect}>
        <CustomText>{label}</CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default ListItem;
