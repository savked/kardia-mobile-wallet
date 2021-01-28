/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {Text, View} from 'react-native';
import IconButton from '../../components/IconButton';
import {styles} from './style';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../ThemeContext';
import {useRecoilValue} from 'recoil';
import {notificationAtom} from '../../atoms/notification';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';

const HomeHeader = () => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  function navigateNotiScreen() {
    navigation.navigate('Notification');
  }

  const notificationList = useRecoilValue(notificationAtom);
  const newNotiCount = notificationList.filter((item) => item.status === 0)
    .length;

  return (
    <View style={styles.headerContainer}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text
          style={{fontSize: 25, fontWeight: 'bold', color: theme.textColor}}>
          {getLanguageString(language, 'WALLET')}
        </Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <IconButton
          name="bell-o"
          size={24}
          color={theme.textColor}
          badge={newNotiCount}
          onPress={navigateNotiScreen}
        />
      </View>
    </View>
  );
};

export default HomeHeader;
