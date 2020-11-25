import React from 'react';
import { View} from 'react-native';
import Button from '../../components/Button'

const HomeScreen = () => {
    function send(){
    console.log('send');
    }

    function receive(){
    console.log('receive');
    }

    return (
        <View >
                <View style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
                <Button title="Send" onClick={send} iconName="paper-plane"/>
                <Button title="Receive" onClick={receive} iconName="download"/>
                </View>
        </View>
    )
}

export default HomeScreen