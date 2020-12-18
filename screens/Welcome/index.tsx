/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, Text, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';

const Welcome = () => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);

  return (
    <View style={styles.noWalletContainer}>
      <View>
        <Image
          style={styles.noWalletLogo}
          source={require('../../assets/logo.png')}
        />
      </View>
      <View>
        <Text
          style={{
            fontSize: 24,
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: 36,
            color: '#B4BDC9',
          }}>
          {getLanguageString(language, 'WELCOME')}
        </Text>
        <Text style={{fontSize: 14, color: '#B4BDC9', textAlign: 'center'}}>
          {getLanguageString(language, 'GETTING_STARTED_DESCRIPTION')}
        </Text>
      </View>
      <View style={{height: 140, justifyContent: 'space-evenly'}}>
        <Button
          size="large"
          title={getLanguageString(language, 'CREATE_NEW_WALLET')}
          type="primary"
          onPress={() => navigation.navigate('CreateWallet')}
          style={{width: 300}}
        />
        <Button
          size="large"
          title={getLanguageString(language, 'IMPORT_WALLET')}
          type="secondary"
          onPress={() => navigation.navigate('ImportMnemonic')}
        />
      </View>
    </View>
  );
};

export default Welcome;
