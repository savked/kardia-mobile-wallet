import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Icon from "react-native-vector-icons/FontAwesome"
import { styles } from './style'

const IconButton = ({name, size, color, onPress, badge}: IconButtonProps) => {
    console.log(onPress)
    return (
        <TouchableOpacity onPress={() => {
            console.log(1112323232323)
            if (onPress) {
                console.log('has onPress')
            }
            onPress && onPress()
        }}>
            <Icon name={name} size={size} color={color} />
            {
                badge && 
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            }
        </TouchableOpacity>
    )
}

export default IconButton