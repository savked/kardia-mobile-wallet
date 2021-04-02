/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {Text, View} from 'react-native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {showTabBarAtom} from '../../atoms/showTabBar';
import {ThemeContext} from '../../ThemeContext';
import ENIcon from 'react-native-vector-icons/Entypo';
import {styles} from './style';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
import {walletsAtom} from '../../atoms/wallets';

export default () => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const theme = useContext(ThemeContext);

  const wallets = useRecoilValue(walletsAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View
        style={{
          width: '100%',
        }}>
        <ENIcon.Button
          name="chevron-left"
          onPress={() => navigation.goBack()}
          backgroundColor="transparent"
          style={{padding: 0, marginBottom: 18}}
        />
        <Text style={{color: theme.textColor, fontSize: 36}}>
          {getLanguageString(language, 'WALLET_MANAGEMENT')}
        </Text>
      </View>
    </View>
  );
};
