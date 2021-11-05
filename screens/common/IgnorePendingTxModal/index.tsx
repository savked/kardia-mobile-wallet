import React, { useContext } from 'react';
import { Image, Linking, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import { pendingTxSelector } from '../../../atoms/pendingTx';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import CustomModal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';
import { copyToClipboard, getTxURL, truncate } from '../../../utils/string';

export default ({onClose, visible}: {
  visible: boolean;
  onClose: () => void
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallets[selectedWallet] ? wallets[selectedWallet].address : ''))

  const getModalStyle = () => {
    return {
      height: 600,
      backgroundColor: theme.backgroundFocusColor,
      justifyContent: 'flex-start',
      padding: 20
    }
  }

  const handleClickLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    });
  };
  
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      contentStyle={getModalStyle()}
      showCloseButton={false}
    >
      <View>
        <Image 
          source={require('../../../assets/ignore_tx.png')}
          style={{
            width: 313,
            height: 203
          }}
        />
      </View>
      <CustomText
        style={{
          color: theme.textColor,
          fontWeight: 'bold',
          fontSize: theme.defaultFontSize + 12,
          marginBottom: 16,
          paddingTop: 12,
        }}
      >
        {getLanguageString(language, 'IGNORE_PENDING_TX_TITLE')}
      </CustomText>
      <CustomText
        style={{
          color: theme.mutedTextColor,
          fontWeight: '500',
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
          fontSize: theme.defaultFontSize + 3,
          textAlign: 'center'
        }}
      >
        {getLanguageString(language, 'IGNORE_PENDING_TX_DESCRIPTION')}
      </CustomText>
      
      <View style={{backgroundColor: '#212121', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginTop: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
        <CustomText style={{color: theme.textColor}}>
          {truncate(pendingTx as string, 16, 16)}
        </CustomText>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => {
            copyToClipboard(pendingTx as string)
          }}>
            <Image source={require('../../../assets/icon/copy.png')} style={{width: 16, height: 16, marginRight: 12}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleClickLink(getTxURL(pendingTx as string))}>
            <Image source={require('../../../assets/icon/external_url_dark.png')} style={{width: 16, height: 16}} />
          </TouchableOpacity>
        </View>
      </View>
      <Button 
        title={getLanguageString(language, 'KEEP_ME_NOTIFY')}
        onPress={onClose}
        block
        type="outline"
        style={{
          marginTop: 32,
          marginBottom: 12
        }}
      />
      <Button 
        title={getLanguageString(language, 'CONFIRM_IGNORE')}
        onPress={() => {
          if (pendingTx) {
            setPendingTx('')
          }
          onClose()
        }}
        block
        type="ghost"
        style={{
          backgroundColor: 'rgba(208, 37, 38, 1)',
        }}
        textStyle={{
          color: '#FFFFFF',
          fontWeight: '500',
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
          fontSize: theme.defaultFontSize + 3
        }}
      />
    </CustomModal>
  )
}
