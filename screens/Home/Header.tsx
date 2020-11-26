import React from "react"
import { Image, Text, View } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"
import IconButton from "../../components/IconButton"
import { styles } from "./style"


const HomeHeader = () => {
    return (
        <View style={styles.headerContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image style={styles.logo} source={require('../../assets/logo.png')} />
                <Text style={{fontSize: 24, fontWeight: 'bold', color: "#000000"}}>Kardia Wallet</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                {/* <Icon name="bell-o" size={24} color='#000000' /> */}
                <IconButton name="bell-o" size={24} color='#000000'  badge={"9"} />
            </View>
        </View>
    )
}

export default HomeHeader