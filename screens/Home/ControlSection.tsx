import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import QRModal from '../common/AddressQRCode';
import NewKRC20TxModal from '../common/NewKRC20TxModal';
import NewTxModal from '../common/NewTxModal';
import SelecTokenForTxModal from '../common/SelecTokenForTxModal';
import {styles} from './style'

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [showNewTxModal, setShowNewTxModal] = useState(false)
  const [showNewKRC20TxModal, setShowKRC20NewTxModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSelectToken, setShowSelectToken] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState(0)
  const [tokenAvatar, setTokenAvatar] = useState('')

  return (
    <View style={{ flexDirection: 'row', width: 180, paddingTop: 30, paddingBottom: 16, justifyContent: 'space-between'}}>
      {
        showNewTxModal && (
          <NewTxModal
            visible={showNewTxModal}
            onClose={() => setShowNewTxModal(false)}
            beforeShowSuccess={() => setShowSelectToken(false)}
          />
        )
      }
      {
        showNewKRC20TxModal && (
          <NewKRC20TxModal
            visible={showNewKRC20TxModal}
            onClose={() => setShowKRC20NewTxModal(false)}
            tokenAddress={tokenAddress}
            tokenSymbol={tokenSymbol}
            tokenDecimals={tokenDecimals}
            tokenAvatar={tokenAvatar}
            fromHome={true}
            beforeShowSuccess={() => setShowSelectToken(false)}
          />
        )
      }
      {
        showSelectToken && (
          <SelecTokenForTxModal
            visible={showSelectToken}
            onClose={() => setShowSelectToken(false)}
            onSelect={({
              selectKAI,
              tokenAddress: _tokenAddress = '',
              tokenSymbol: _tokenSymbol = '',
              tokenDecimals: _tokenDecimals = 0,
              tokenAvatar: _tokenAvatar = ''
            }: {
              selectKAI: boolean, 
              tokenAddress?: string, 
              tokenSymbol?: string, 
              tokenDecimals?: number, 
              tokenAvatar?: string
            }) => {
              if (selectKAI) {
                setShowNewTxModal(true)
              } else {
                setTokenAddress(_tokenAddress)
                setTokenSymbol(_tokenSymbol)
                setTokenDecimals(_tokenDecimals)
                setTokenAvatar(_tokenAvatar)
                setShowKRC20NewTxModal(true)
              }
            }}
          />
        )
      }
      <QRModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
      <View style={{alignItems: 'center', justifyContent: 'center', width: '33%'}}>
        <TouchableOpacity
          style={[styles.controlButton, {backgroundColor: theme.secondaryColor}]}
          onPress={() => setShowSelectToken(true)}
        >
          <Image
            source={require('../../assets/icon/send_button.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
          
        </TouchableOpacity>
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {getLanguageString(language, 'SEND')}
        </CustomText>
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center', width: '33%'}}>
        <TouchableOpacity
          style={[styles.controlButton, {backgroundColor: theme.secondaryColor}]}
          onPress={() => setShowQRModal(true)}
        >
          <Image
            source={require('../../assets/icon/receive_button.png')}
            style={{
              width: 20,
              height: 20
            }}
          />
        </TouchableOpacity>
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {getLanguageString(language, 'RECEIVE')}
        </CustomText>
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center', width: '33%'}}>
        <TouchableOpacity
          style={[styles.controlButton, {backgroundColor: theme.secondaryColor}]}
          onPress={() => navigation.navigate('TransactionList')}
        >
          <Image
            source={require('../../assets/icon/transaction_dark.png')}
            style={{
              width: 20,
              height: 20,
            }}
          />
        </TouchableOpacity>
        <CustomText
          style={{
            color: theme.textColor,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 1
          }}
        >
          {getLanguageString(language, 'HISTORY')}
        </CustomText>
      </View>
    </View>
  )
}