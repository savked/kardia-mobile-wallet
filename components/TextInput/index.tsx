import React, { useContext } from 'react'
import { TextInput, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ThemeContext } from '../../App';
import {styles} from './style'

const CustomTextInput = ({
    onChangeText, value, iconName, 
    onIconPress, headline, multiline = false, 
    numberOfLines = 5, editable = true, placeholder, block
}: CustomTextInputProps) => {
    const theme = useContext(ThemeContext)
    return (
        <>
            { headline && <Text style={[styles.headline, {color: theme.textColor}]}>{headline}</Text> }
            <View style={[{ flexDirection: 'row', alignItems: 'center' }, block ? { width: '100%' } : null]}>
                <TextInput
                    style={[styles.input, multiline ? styles.multiline : null, block ? { width: '100%' } : null]}
                    onChangeText={onChangeText}
                    value={value}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                    editable={editable}
                    placeholder={placeholder}
                />
                {
                    iconName && <Icon onPress={onIconPress} name={iconName} size={25} color={"black"} style={{ position: 'absolute', right: 15 }} />
                }
            </View>
        </>
    )
}

export default CustomTextInput;