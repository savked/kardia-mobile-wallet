/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import IconButton from '../../components/IconButton';
import {styles} from './style';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../ThemeContext';
import {useRecoilValue} from 'recoil';
import {notificationAtom} from '../../atoms/notification';
import {getLanguageString} from '../../utils/lang';
import NewTxModal from '../common/NewTxModal';
import {languageAtom} from '../../atoms/language';
import CustomText from '../../components/Text';

const HomeHeader = () => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const [showNewTxModal, setShowNewTxModal] = useState(false);

  function navigateNotiScreen() {
    navigation.navigate('Notification');
  }

  const notificationList = useRecoilValue(notificationAtom);
  const newNotiCount = notificationList.filter((item) => item.status === 0)
    .length;

  return (
    <View style={styles.headerContainer}>
      <NewTxModal
        visible={showNewTxModal}
        onClose={() => setShowNewTxModal(false)}
      />
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <CustomText
          style={{fontSize: 36, color: theme.textColor, fontFamily: 'Work Sans'}}>
          {getLanguageString(language, 'WALLET')}
        </CustomText>
      </View>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity onPress={() => navigation.navigate('ImportWallet')}>
          <Image 
            source={require('../../assets/icon/plus_dark.png')}
            style={{width: 24, height: 24, marginRight: 8}}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ImportWallet')}>
          <Image 
            source={require('../../assets/icon/menu.png')}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
