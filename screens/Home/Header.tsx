import React from "react"
import { Image, Text, View } from "react-native"
import IconButton from "../../components/IconButton"
import { styles } from "./style"


const HomeHeader = () => {

    return (
        <View style={styles.headerContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image style={styles.logo} source={require('../../assets/logo.png')} />
                <Text style={{fontSize: 20, fontWeight: 'bold', color: "#FFFFFF"}}>Kardia Wallet</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <IconButton name="bell-o" size={20} color='#FFFFFF' badge={"9"} />
            </View>  
        </View>
    )
}

export default HomeHeader