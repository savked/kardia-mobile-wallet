/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, Dimensions, View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
// import {RNCamera} from 'react-native-camera';

export default () => {
  const accessMnemonic = () => {};
  return (
    <View style={{flex: 1}}>
      <QRCodeScanner
        onRead={accessMnemonic}
        // flashMode={RNCamera.Constants.FlashMode.torch}
        topViewStyle={{height: 0}}
        bottomViewStyle={{height: 0}}
        cameraStyle={{height: Dimensions.get('window').height}}
      />
    </View>
  );
};
