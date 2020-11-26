import React from 'react'
import { TextInput, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './style'

const CustomTextInput = ({onChangeText, value, iconName, onIconPress, headline}: CustomTextInputProps) => {
    return (
        <>
            { headline && <Text style={styles.headline}>{headline}</Text> }
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeText}
                    value={value}
                />
                {
                    iconName && <Icon onPress={onIconPress} name={iconName} size={25} color={"black"} style={{ position: 'absolute', right: 15 }} />
                }
            </View>
        </>
    )
}

export default CustomTextInput;