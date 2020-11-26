import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from './style';

const parseSize = (size: string) => {
    let sizeStyle = styles.mediumButton
    if (size === "small") {
        sizeStyle = styles.smallButton
    } else if (size === "large") {
        sizeStyle = styles.largeButton
    }
    return sizeStyle
}

const parseType = (type: string) => {
    let typeStyle = styles.primaryButton
    let textTypeStyle = styles.primaryButtonText
    if (type === "secondary") {
        typeStyle = styles.secondaryButton
        textTypeStyle = styles.secondaryButtonText
    } else if (type === "outline") {
        typeStyle = styles.outlineButton
        textTypeStyle = styles.outlineButtonText
    } else if (type === "ghost") {
        typeStyle = styles.ghostButton
        textTypeStyle = styles.ghostButtonText
    } else if (type === "link") {
        typeStyle = styles.linkButton
        textTypeStyle = styles.linkButtonText
    }

    return {typeStyle, textTypeStyle}
}

const Button = ({title, style, textStyle, onPress, icon, iconName, size = "medium", type = 'primary'}: ButtonProps) => {
    const {typeStyle, textTypeStyle} = parseType(type)

    const renderIcon = () => {
        if (icon) return icon
        if (iconName) {
            let iconColor = '#FFFFFF'
            switch (type) {
                case "secondary":
                    iconColor= '#AD182A'
                    break;
                case "outline":
                    iconColor= '#000000'
                    break;
                case "ghost":
                    iconColor= '#364766'
                    break;
                default:
                    break;
            }
            if (textStyle && textStyle.color) iconColor = textStyle.color
            return <Icon style={styles.icon} name={iconName} color={iconColor} size={14} />
        }
        return null
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, parseSize(size), typeStyle, style, type === "link" ? {padding: 0, minWidth: 0} : null]}
        >
            <View style={{display:'flex', flexDirection: 'row', alignItems:'center'}}>
                {
                    renderIcon()
                }
                {/* <Icon name={iconName} size={size} color={color} style={{marginRight:8}}/> */}
                <Text style={[styles.title, textTypeStyle, textStyle]}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default Button
