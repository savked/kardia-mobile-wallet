import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

const Button = ({title, onClick, iconName, size = 10, color = '#eee'}) => {
    onClick: () => {};
    return (
        <View>
            <TouchableOpacity
                onPress={onClick}
                style={[styles.button]}
            >
                <View style={{display:'flex', flexDirection: 'row', alignItems:'center'}}>
                <Icon name={iconName} size={size} color={color} style={{marginRight:8}}/>
                <Text style={styles.title}>{title}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
      backgroundColor: "#AD182A",
      borderRadius:8,
      padding:13,
      maxWidth:100,
      minWidth:100,
      justifyContent:'center',
      alignItems:'center',
    },
    title:{
        color:'white'
    }
  });

export default Button
