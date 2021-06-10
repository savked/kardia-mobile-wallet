import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import QRModal from '../common/AddressQRCode';
import NewTxModal from '../common/NewTxModal';
import {styles} from './style'

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)

  const [showNewTxModal, setShowNewTxModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <View style={{width: '100%', flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 16, justifyContent: 'space-between'}}>
      {
        showNewTxModal && (
          <NewTxModal
            visible={showNewTxModal}
            onClose={() => setShowNewTxModal(false)}
          />
        )
      }
      <QRModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
      <TouchableOpacity
        style={[styles.controlButton, {backgroundColor: theme.backgroundStrongColor}]}
        onPress={() => setShowQRModal(true)}
      >
        <Image
          source={require('../../assets/icon/receive_button.png')}
          style={{
            width: 24,
            height: 24,
            marginRight: 8
          }}
        />
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          Receive
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.controlButton, {backgroundColor: theme.backgroundStrongColor}]}
        onPress={() => setShowNewTxModal(true)}
      >
        <Image
          source={require('../../assets/icon/send_button.png')}
          style={{
            width: 24,
            height: 24,
            marginRight: 8
          }}
        />
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          Send
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.controlButton, {backgroundColor: theme.backgroundStrongColor}]}
        onPress={() => navigation.navigate('TransactionList')}
      >
        <Image
          source={require('../../assets/icon/transaction_dark.png')}
          style={{
            width: 24,
            height: 24,
            marginRight: 8
          }}
        />
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          History
        </CustomText>
      </TouchableOpacity>
    </View>
  )
}