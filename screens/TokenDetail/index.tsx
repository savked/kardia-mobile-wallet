/* eslint-disable react-native/no-inline-styles */
import {useRoute} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {Image, Text, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import AddressQRModal from '../common/AddressQRCode';
import {styles} from './style';
import TokenTxList from './TokenTxList';

const TokenDetail = () => {
  const theme = useContext(ThemeContext);
  const {params} = useRoute();
  const tokenAvatar = params ? (params as Record<string, any>).avatar : '';
  const tokenBalance = params ? (params as Record<string, any>).balance : 0;
  const tokenSymbol = params ? (params as Record<string, any>).symbol : '';
  const tokenAddress = params
    ? (params as Record<string, any>).tokenAddress
    : '';

  const language = useRecoilValue(languageAtom);

  const [showAddressQR, setShowAddressQR] = useState(false);

  const renderIcon = (avatar: string) => {
    return (
      <View
        style={{
          width: 60,
          height: 60,

          borderRadius: 30,
          backgroundColor: 'white',

          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',

          marginBottom: 12,
        }}>
        {avatar ? (
          <Image source={{uri: avatar}} style={styles.tokenLogo} />
        ) : (
          <Image
            source={require('../../assets/logo.png')}
            style={styles.kaiLogo}
          />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <AddressQRModal
        visible={showAddressQR}
        onClose={() => setShowAddressQR(false)}
      />
      <View
        style={{
          flex: 1,
          width: '100%',
          alignItems: 'center',
          paddingVertical: 20,
          borderBottomColor: '#C4C4C4',
          borderBottomWidth: 0.3,
        }}>
        {renderIcon(tokenAvatar)}
        <Text style={{fontSize: 20, color: theme.textColor}}>
          {tokenBalance} {tokenSymbol}
        </Text>
        <View style={styles.buttonGroupContainer}>
          <Button
            title={getLanguageString(language, 'SEND_TOKEN').replace(
              '{{TOKEN_SYMBOL}}',
              tokenSymbol,
            )}
            type="outline"
            onPress={() => {}}
            iconName="paper-plane"
            size="small"
            textStyle={{color: '#FFFFFF'}}
            style={{marginRight: 5}}
          />

          <Button
            onPress={() => setShowAddressQR(true)}
            title={getLanguageString(language, 'RECEIVE_TOKEN').replace(
              '{{TOKEN_SYMBOL}}',
              tokenSymbol,
            )}
            size="small"
            type="outline"
            iconName="download"
            style={{marginLeft: 5, marginRight: 5}}
            textStyle={{color: '#FFFFFF'}}
          />
        </View>
      </View>
      <View style={{flex: 3, width: '100%'}}>
        <TokenTxList
          tokenAddress={tokenAddress}
          tokenAvatar={tokenAvatar}
          tokenSymbol={tokenSymbol}
        />
      </View>
    </View>
  );
};

export default TokenDetail;
