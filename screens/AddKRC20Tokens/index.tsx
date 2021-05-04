import { useNavigation } from '@react-navigation/core';
import React, { useContext, useState } from 'react';
import ENIcon from 'react-native-vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../ThemeContext';
import {styles} from './style'
import CustomText from '../../components/Text';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { getLanguageString } from '../../utils/lang';
import { Image, TouchableOpacity, View } from 'react-native';
import NewTokenModal from '../common/NewTokenModal';

export default () => {
  const theme = useContext(ThemeContext)
  const navigation = useNavigation()
  const language = useRecoilValue(languageAtom)

  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <NewTokenModal 
        visible={showModal} 
        onClose={() => {
          setShowModal(false)
        }}
        onSuccess={() => {
          setShowModal(false);
          navigation.goBack();
        }}
      />
      <ENIcon.Button
        style={{paddingHorizontal: 20}}
        name="chevron-left"
        onPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />
      <CustomText
        style={{color: theme.textColor, paddingHorizontal: 20, fontSize: 36}}>
        {getLanguageString(language, 'ADD_TOKEN')}
      </CustomText>
      <CustomText
        style={{
          fontSize: 15,
          color: 'rgba(252, 252, 252, 0.54)',
          marginTop: 6,
          lineHeight: 22,
          marginHorizontal: 20,
        }}>
        {getLanguageString(language, 'ADD_TOKEN_DESCRIPTION')}
      </CustomText>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddVerifiedKRC20Tokens')}
        style={[
          styles.cardWrapper,
          {backgroundColor: theme.backgroundFocusColor},
        ]}>
        {/* <Image
          style={{width: 185, height: 162}}
          source={require('../../assets/import_private_key.png')}
        /> */}
        <View style={{marginBottom: 24, marginLeft: 18}}>
          <CustomText
            allowFontScaling={false}
            style={{fontSize: 24, color: theme.textColor, fontWeight: 'bold'}}>
            {getLanguageString(language, 'VERIFIED_TOKENS')}
          </CustomText>
          <CustomText style={{fontSize: 15, color: 'rgba(252, 252, 252, 0.54)'}}>
            {getLanguageString(language, 'VERIFIED_TOKENS_DESC')}
          </CustomText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={[
          styles.cardWrapper,
          {backgroundColor: theme.backgroundFocusColor},
        ]}>
        {/* <Image
          style={{width: 185, height: 162}}
          source={require('../../assets/import_seed_phrase.png')}
        /> */}
        <View style={{marginBottom: 24, marginLeft: 18}}>
          <CustomText
            allowFontScaling={false}
            style={{fontSize: 24, color: theme.textColor, fontWeight: 'bold'}}>
            {getLanguageString(language, 'ADD_CUSTOM_TOKEN')}
          </CustomText>
          <CustomText style={{fontSize: 15, color: 'rgba(252, 252, 252, 0.54)'}}>
            {getLanguageString(language, 'CUSTOM_TOKENS_DESC')}
          </CustomText>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};