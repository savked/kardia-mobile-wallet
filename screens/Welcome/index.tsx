/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useContext} from 'react';
import {Image, Text, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';
import {ThemeContext} from '../../ThemeContext';

const Welcome = () => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const theme = useContext(ThemeContext);

  return (
    <SafeAreaView
      style={[
        styles.noWalletContainer,
        {backgroundColor: theme.backgroundColor},
      ]}>
      <View style={{flex: 4, alignItems: 'center', justifyContent: 'center'}}>
        <View style={{width: 188, height: 188, marginBottom: 58}}>
          <Image
            style={styles.noWalletLogo}
            source={require('../../assets/welcome_background.png')}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 24,
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: 4,
              color: '#B4BDC9',
            }}>
            {getLanguageString(language, 'WELCOME')}
          </Text>
          <Text style={{fontSize: 14, color: '#B4BDC9', textAlign: 'center'}}>
            {getLanguageString(language, 'GETTING_STARTED_DESCRIPTION')}
          </Text>
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'space-evenly'}}>
        <Button
          title={getLanguageString(language, 'CREATE_NEW_WALLET')}
          type="outline"
          onPress={() => navigation.navigate('CreateWallet')}
          style={{width: 300}}
        />
        <Button
          title={getLanguageString(language, 'IMPORT_WALLET')}
          type="primary"
          onPress={() => navigation.navigate('ImportMnemonic', {fromNoWallet: true})}
        />
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
