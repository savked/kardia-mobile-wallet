import React from 'react'
import { TextInput, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {styles} from './style'

const CustomTextInput = ({onChangeText, value, iconName, onIconPress, headline, multiline = false, numberOfLines = 5}: CustomTextInputProps) => {
    return (
        <>
            { headline && <Text style={styles.headline}>{headline}</Text> }
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                    style={[styles.input, multiline ? styles.multiline : null]}
                    onChangeText={onChangeText}
                    value={value}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                />
                {
                    iconName && <Icon onPress={onIconPress} name={iconName} size={25} color={"black"} style={{ position: 'absolute', right: 15 }} />
                }
            </View>
        </>
    )
}

export default CustomTextInput;