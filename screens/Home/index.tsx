import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../../components/Button'

const HomeScreen = () => {
  function send() {
    console.log('send');
  }

  function receive() {
    console.log('receive');
  }

  return (
    <View >
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Button 
          title="Send" 
          type="primary" 
          onPress={send} 
          // icon={<Icon name="paper-plane" />}
          iconName="paper-plane"
        />
        <Button title="Receive" type="outline" onPress={receive} />
      </View>
    </View>
  )
}

export default HomeScreen