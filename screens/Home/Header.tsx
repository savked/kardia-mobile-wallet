import React from "react"
import { Image, Text, View } from "react-native"
import IconButton from "../../components/IconButton"
import { styles } from "./style"
import { useNavigation } from '@react-navigation/native';


const HomeHeader = () => {
  const navigation = useNavigation()

    function navigateNotiScreen(){
        navigation.navigate('Notification');
    }

    return (
        <View style={styles.headerContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image style={styles.logo} source={require('../../assets/logo.png')} />
                <Text style={{fontSize: 24, fontWeight: 'bold', color: "#000000"}}>Kardia Wallet</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <IconButton name="bell-o" size={24} color='#000000' badge={"9"} onPress={navigateNotiScreen}/>
            </View>  
        </View>
    )
}

export default HomeHeader