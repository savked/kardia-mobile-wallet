import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native';
import { styles } from './style';
const ListItem = ({label, value, onSelect}: ListItemProps) => {
    return (
        <View style={styles.listItem}>
            <TouchableOpacity onPress={onSelect}>
                <Text>{label}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ListItem;