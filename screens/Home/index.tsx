import React from 'react';
import { View } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Button from '../../components/Button'

const HomeScreen = () => {
  function send() {
    console.log('send');
  }

  function receive() {
    console.log('receive');
  }

  return (
    <SafeAreaView>
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
    </SafeAreaView>
  )
}

export default HomeScreen