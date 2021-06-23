import React, { useCallback, useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import {styles} from './style';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import CustomTextInput from '../../components/TextInput';
import { getSearchURL, isURL, parseURL } from '../../utils/string';
import { View } from 'react-native';
import FavoriteDapp from '../DAppBrowser/FavoriteDapp';
import { showTabBarAtom } from '../../atoms/showTabBar';

const DAppHome = () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const navigation = useNavigation()
  const [url, setURL] = useState('');

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <CustomText
        style={{color: theme.textColor, paddingHorizontal: 20, fontSize: 36}}>
        {getLanguageString(language, 'DAPP')}
      </CustomText>
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 6
        }}
      >
        <CustomTextInput
          autoCompleteType="off"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder={getLanguageString(language, 'SEARCH_DAPP_PLACEHOLDER')}
          placeholderTextColor={theme.mutedTextColor}
          onSubmitEditing={(e) => {
            if (!e.nativeEvent.text) return;
            const parsedURL = parseURL(e.nativeEvent.text)
            // setURL(parsedURL)
            if (isURL(parsedURL)) {
              navigation.navigate('DAppBrowser', {
                appURL: parsedURL
              })
            } else {
              navigation.navigate('DAppBrowser', {
                appURL: getSearchURL(e.nativeEvent.text)
              })
            }
            // setLoadingURL(true)
          }}
          value={url}
          onChangeText={setURL}
          inputStyle={{
            backgroundColor: theme.backgroundFocusColor,
            color: theme.textColor
          }}
        />
      </View>
      <View style={{flex: 1}}>
        <CustomText 
          style={{
            color: theme.textColor,
            fontWeight: 'bold', 
            marginHorizontal: 20,
            marginTop: 22,
            marginBottom: 8,
            fontSize: theme.defaultFontSize + 6
          }
        }
          >Quick Access
        </CustomText>
        <FavoriteDapp keyword={url} onAppSelect={(app) =>{
          if (!app.url) return;
          const parsedURL = parseURL(app.url)
          navigation.navigate('DAppBrowser', {
            appURL: parsedURL
          })
        }} />
      </View>
    </SafeAreaView>
  );
};

export default DAppHome;
