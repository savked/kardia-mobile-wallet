/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {View, Text, Image} from 'react-native';
import Modal from '../../../components/Modal';
import {ThemeContext} from '../../../ThemeContext';
import {parseKaiBalance} from '../../../utils/number';
import { truncate } from '../../../utils/string';
import {styles} from './style';

export default ({
  txObj,
  visible,
  onClose,
}: {
  txObj?: Record<string, any>;
  visible: boolean;
  onClose: () => void;
}) => {
  const theme = useContext(ThemeContext);
  if (!txObj) {
    return null;
  }
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={{backgroundColor: theme.backgroundFocusColor}}>
      <View style={[styles.container]}>
        <View
          style={{
            width: 64,
            height: 64,

            borderRadius: 16,
            backgroundColor: theme.backgroundColor,

            // flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            position: 'absolute',
            top: -67,

            borderWidth: 1,
            borderColor: 'gray',
          }}>
          {txObj.type === 'IN' ? (
            <Image
              source={require('../../../assets/icon/receive.png')}
              style={styles.logo}
            />
          ) : (
            <Image
              source={require('../../../assets/icon/send.png')}
              style={styles.logo}
            />
          )}
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={[
              styles.amountText,
              {color: theme.textColor, marginRight: 12},
            ]}>
            {parseKaiBalance(txObj.amount, true)}
          </Text>
          <Text style={{color: theme.textColor, fontSize: 18}}>KAI</Text>
        </View>
        <Text style={styles.txhash}>{truncate(txObj.hash, 14, 14)}</Text>
      </View>
    </Modal>
  );
};
