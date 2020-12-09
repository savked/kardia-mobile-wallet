import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import {ThemeContext} from '../../App';
import {styles} from './style';

const SettingScreen = () => {
  const theme = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Text>Setting screen</Text>
    </View>
  );
};
export default SettingScreen;
