/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import Icon from 'react-native-vector-icons/Entypo';
import {showTabBarAtom} from '../../atoms/showTabBar';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
import { SafeAreaView } from 'react-native-safe-area-context';
import { statusBarColorAtom } from '../../atoms/statusBar';
import CustomText from '../../components/Text';

export default () => {
  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Icon.Button
        style={{paddingLeft: 0}}
        name="chevron-left"
        onPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />
      <CustomText style={[styles.title, {color: theme.textColor}]}>
        {getLanguageString(language, 'IMPORT_WALLET')}
      </CustomText>
      <CustomText
        style={{
          fontSize: 15,
          color: 'rgba(252, 252, 252, 0.54)',
          marginTop: 6,
          lineHeight: 22,
        }}>
        {getLanguageString(language, 'IMPORT_WALLET_DESCRIPTION')}
      </CustomText>
      <TouchableOpacity
        onPress={() => navigation.navigate('ImportPrivateKey')}
        style={[
          styles.cardWrapper,
          {backgroundColor: theme.backgroundFocusColor},
        ]}>
        <Image
          style={{width: 185, height: 162}}
          source={require('../../assets/import_private_key.png')}
        />
        <View style={{marginBottom: 24, marginLeft: 18}}>
          <CustomText
            allowFontScaling={false}
            style={{fontSize: 24, color: theme.textColor, fontWeight: 'bold'}}>
            Import
          </CustomText>
          <CustomText style={{fontSize: 15, color: 'rgba(252, 252, 252, 0.54)'}}>
            {getLanguageString(language, 'BY_PRIVATE_KEY')}
          </CustomText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('ImportMnemonic')}
        style={[
          styles.cardWrapper,
          {backgroundColor: theme.backgroundFocusColor},
        ]}>
        <Image
          style={{width: 185, height: 162}}
          source={require('../../assets/import_seed_phrase.png')}
        />
        <View style={{marginBottom: 24, marginLeft: 18}}>
          <CustomText
            allowFontScaling={false}
            style={{fontSize: 24, color: theme.textColor, fontWeight: 'bold'}}>
            Import
          </CustomText>
          <CustomText style={{fontSize: 15, color: 'rgba(252, 252, 252, 0.54)'}}>
            {getLanguageString(language, 'BY_SEED_PHRASE')}
          </CustomText>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
