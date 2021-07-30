/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Dimensions, ImageBackground, RefreshControl, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './style';
import HomeHeader from './Header';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {
  getAppPasscodeSetting,
  getSelectedWallet,
  getWallets,
  saveWallets,
} from '../../utils/local';
import {ThemeContext} from '../../ThemeContext';
import {getBalance} from '../../services/account';
import CardSliderSection from './CardSliderSection';
import {languageAtom} from '../../atoms/language';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
// import RemindPasscodeModal from '../common/RemindPasscodeModal';
import {getStakingAmount, getUndelegatingAmount} from '../../services/staking';
import TokenListSection from './TokenListSection';
import {showTabBarAtom} from '../../atoms/showTabBar';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { HEADER_HEIGHT } from '../../theme';
import { statusBarColorAtom } from '../../atoms/statusBar';

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window')

const HomeScreen = () => {
  
  const [showPasscodeRemindModal, setShowPasscodeRemindModal] = useState(false);
  const [inited, setInited] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTime, setRefreshTime] = useState(Date.now())

  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const tabBarHeight = useBottomTabBarHeight();

  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const navigation = useNavigation();

  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useEffect(() => {
    (async () => {

      // Get local auth setting
      const enabled = await getAppPasscodeSetting();
      if (!enabled) {
        setShowPasscodeRemindModal(true);
      } else {
        setShowPasscodeRemindModal(false);
      }
      setInited(true);
    })();
  }, []);

  const updateWalletBalance = async (newSelectedWallet?: number) => {
    const _wallets = await getWallets();
    const _selectedWallet =
      newSelectedWallet !== undefined
        ? newSelectedWallet
        : await getSelectedWallet();
    if (!_wallets[_selectedWallet]) {
      return;
    }
    try {
      const balance = await getBalance(_wallets[_selectedWallet].address);
      const staked = await getStakingAmount(_wallets[_selectedWallet].address);
      const undelegating = await getUndelegatingAmount(_wallets[_selectedWallet].address);

      const newWallets: Wallet[] = JSON.parse(JSON.stringify(_wallets));
      newWallets.forEach((walletItem, index) => {
        if (walletItem.address === _wallets[_selectedWallet].address) {
          newWallets[index].balance = balance;
          newWallets[index].staked = staked;
          newWallets[index].undelegating = undelegating;
        }
      });
      await saveWallets(newWallets)
      setWallets(newWallets);
      _selectedWallet !== selectedWallet && setSelectedWallet(_selectedWallet);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      updateWalletBalance();
      setTabBarVisible(true);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!inited) {
      return;
    }
    updateWalletBalance(selectedWallet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  if (!inited) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
        <ActivityIndicator color={theme.textColor} size="large" />
      </SafeAreaView>
    );
  }

  if (showPasscodeRemindModal) {
    setShowPasscodeRemindModal(false);
    // navigation.navigate('NewPasscode');
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Setting',
          state: {
            routes: [{name: 'NewPasscode', params: {fromHome: true}}],
          },
        },
      ],
    });
  }

  const onRefresh = async () => {
    setRefreshing(true)
    setRefreshTime(Date.now())
    await updateWalletBalance();
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.backgroundColor}}>
      <HomeHeader />
      <ImageBackground
        source={require('../../assets/home_background.jpg')}
        imageStyle={{width: viewportWidth, height: viewportHeight, resizeMode: 'cover'}}
        style={{width: viewportWidth, height: viewportHeight - tabBarHeight - HEADER_HEIGHT - 48}}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={[styles.bodyContainer]} 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.textColor]}
              tintColor={theme.textColor}
              titleColor={theme.textColor}
            />
          }
        >
          <CardSliderSection />
          <TokenListSection refreshTime={refreshTime} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HomeScreen;
