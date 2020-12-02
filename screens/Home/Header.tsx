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
                <Text style={{fontSize: 20, fontWeight: 'bold', color: "#FFFFFF"}}>Kardia Wallet</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
<<<<<<< HEAD
                <IconButton name="bell-o" size={24} color='#000000' badge={"9"} onPress={navigateNotiScreen}/>
=======
                <IconButton name="bell-o" size={20} color='#FFFFFF' badge={"9"} />
>>>>>>> 52ba04134051115534e40c60773b5f88439455a7
            </View>  
        </View>
    )
}

export default HomeHeader