import { useFocusEffect, useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext, useState } from 'react';
import { Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ENIcon from 'react-native-vector-icons/Entypo';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { statusBarColorAtom } from '../../atoms/statusBar';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getSearchURL, isURL, parseURL } from '../../utils/string';
import Dashboard from './Dashboard';
import SearchResult from './SearchResult';
import { styles } from './style';

const DAppHome = () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const navigation = useNavigation()
  const [url, setURL] = useState('');

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  const insets = useSafeAreaInsets();

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={[styles.container, {backgroundColor: theme.backgroundColor, paddingTop: insets.top}]}>
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
            icons={() => {
              if (url !== '') {
                return (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: 10,
                    }}
                    onPress={() => setURL('')}
                  >
                    <ENIcon
                      size={20}
                      style={{
                        color: theme.textColor,
                      }}
                      name="cross"
                    />
                  </TouchableOpacity>
                )
              } else {
                return null
              }
            }}
          />
        </View>
        <View style={{flex: 1}}>
          {
            url === '' ? <Dashboard /> : <SearchResult url={url} />
          }
          {/* <FavoriteDapp keyword={url} onAppSelect={(app) =>{
            if (!app.url) return;
            const parsedURL = parseURL(app.url)
            navigation.navigate('DAppBrowser', {
              appURL: parsedURL,
              allowLandscape: app.allowLandscape
            })
          }} /> */}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DAppHome;
