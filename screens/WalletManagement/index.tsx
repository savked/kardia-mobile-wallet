/* eslint-disable react-native/no-inline-styles */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntIcon from 'react-native-vector-icons/AntDesign';
import ENIcon from 'react-native-vector-icons/Entypo';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { statusBarColorAtom } from '../../atoms/statusBar';
import { walletsAtom } from '../../atoms/wallets';
import Button from '../../components/Button';
import List from '../../components/List';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString, parseCardAvatar } from '../../utils/lang';
import { truncate } from '../../utils/string';
import { styles } from './style';

export default () => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const theme = useContext(ThemeContext);

  const wallets = useRecoilValue(walletsAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom)

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View
        style={{
          width: '100%',
          marginBottom: 19,
        }}>
        <ENIcon.Button
          name="chevron-left"
          onPress={() => navigation.goBack()}
          backgroundColor="transparent"
          style={{padding: 0, marginBottom: 18}}
        />
        <CustomText style={{color: theme.textColor, fontSize: 36}}>
          {getLanguageString(language, 'WALLET_MANAGEMENT')}
        </CustomText>
      </View>
      <List
        keyExtractor={(item: Wallet) => item.address}
        items={wallets}
        render={(item: Wallet) => {
          return (
            <TouchableOpacity onPress={() => navigation.navigate('WalletDetail', {address: item.address})} style={[styles.walletItemContainer, {backgroundColor: theme.backgroundFocusColor}]}>
              <View style={styles.cardImageContainer}>
                <Image style={styles.cardImage} source={parseCardAvatar(item.cardAvatarID || 0)} />
                <View style={styles.pinButton}></View>
              </View>
              <View style={{justifyContent: 'space-between'}}>
                <CustomText style={{color: theme.textColor, fontSize: 13, fontWeight: 'bold'}}>{item.name || getLanguageString(language, 'NEW_WALLET')}</CustomText>
                <CustomText style={{fontSize: theme.defaultFontSize, color: 'rgba(252, 252, 252, 0.54)'}}>{truncate(item.address, 10, 10)}</CustomText>
              </View>
            </TouchableOpacity>
          )
        }}
      />
      <Button
        type="primary"
        icon={<AntIcon name="plus" size={24} />}
        size="small"
        onPress={() => navigation.navigate('ImportWallet')}
        style={styles.floatingButton}
      />
    </SafeAreaView>
  );
};
