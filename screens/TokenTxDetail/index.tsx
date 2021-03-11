import React, {useContext} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './styles';

const TokenTxDetail = ({txData}: {txData: KRC20Transaction}) => {
  const theme = useContext(ThemeContext);

  if (!txData) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ActivityIndicator color={theme.textColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Text>123</Text>
    </View>
  );
};

export default TokenTxDetail;
