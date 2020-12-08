/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {Text, View} from 'react-native';
import IconButton from '../../components/IconButton';
import {styles} from './style';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../App';

const HomeHeader = () => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  function navigateNotiScreen() {
    navigation.navigate('Notification');
  }

  return (
    <View style={styles.headerContainer}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {/* <Image style={styles.logo} source={require('../../assets/logo.png')} /> */}
        <Text
          style={{fontSize: 25, fontWeight: 'bold', color: theme.textColor}}>
          Wallet
        </Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <IconButton
          name="bell-o"
          size={24}
          color={theme.textColor}
          badge={'9'}
          onPress={navigateNotiScreen}
        />
      </View>
    </View>
  );
};

export default HomeHeader;
