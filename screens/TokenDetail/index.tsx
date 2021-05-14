/* eslint-disable react-native/no-inline-styles */
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Image, TouchableOpacity, View, Dimensions} from 'react-native';
import ENIcon from 'react-native-vector-icons/Entypo';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {krc20ListAtom} from '../../atoms/krc20';
import {languageAtom} from '../../atoms/language';
import {DEFAULT_KRC20_TOKENS} from '../../config';
import {getBalance} from '../../services/krc20';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {
  getSelectedWallet,
  getTokenList,
  getWallets,
  saveTokenList,
} from '../../utils/local';
import {parseDecimals} from '../../utils/number';
import AddressQRModal from '../common/AddressQRCode';
import {styles} from './style';
import TokenTxList from './TokenTxList';
import numeral from 'numeral';
import {showTabBarAtom} from '../../atoms/showTabBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/Text';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';

const {width: viewportWidth} = Dimensions.get('window');

const TokenDetail = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const {params} = useRoute();
  const tokenAvatar = params ? (params as Record<string, any>).avatar : '';
  // const tokenBalance = params ? (params as Record<string, any>).balance : 0;
  const tokenSymbol = params ? (params as Record<string, any>).symbol : '';
  const tokenAddress = params
    ? (params as Record<string, any>).tokenAddress
    : '';
  const tokenDecimals = params ? (params as Record<string, any>).decimals : 18;

  const language = useRecoilValue(languageAtom);

  const [showAddressQR, setShowAddressQR] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const setTokenList = useSetRecoilState(krc20ListAtom);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const fetchBalance = async () => {
    const _wallets = await getWallets();
    const _selectedWallet = await getSelectedWallet();
    const wallet = _wallets[_selectedWallet];
    const _balance = await getBalance(tokenAddress, wallet.address);
    setTokenBalance(_balance);
  };

  const shouldRemove = (item: KRC20, tokenAddressToRemove: string) => {
    return item.address === tokenAddressToRemove && item.walletOwnerAddress === wallets[selectedWallet].address
  }

  const removeToken = async (_tokenAddress: string) => {
    const localTokens = await getTokenList();
    const DEFAULT_ID = DEFAULT_KRC20_TOKENS.map((i) => i.id);

    const newLocalTokens = localTokens.filter(
      (i) => !shouldRemove(i, _tokenAddress) && !DEFAULT_ID.includes(i.address),
    );
    await saveTokenList(newLocalTokens);

    setTokenList(newLocalTokens);
    navigation.goBack();
  };

  useEffect(() => {
    (async () => {
      await fetchBalance();
      const intervalId = setInterval(async () => {
        await fetchBalance();
      }, 2000);
      return () => {
        clearInterval(intervalId);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress]);

  const renderIcon = (avatar: string) => {
    return (
      <View
        style={{
          width: 48,
          height: 48,

          borderRadius: 16,
          backgroundColor: 'transparent',

          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',

          marginBottom: 12,
        }}>
        {avatar ? (
          <Image source={{uri: avatar}} style={styles.tokenLogo} />
        ) : (
          <Image
            source={require('../../assets/logo.png')}
            style={styles.kaiLogo}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <AddressQRModal
        visible={showAddressQR}
        onClose={() => setShowAddressQR(false)}
      />
      <ENIcon.Button
        style={{paddingHorizontal: 20}}
        name="chevron-left"
        onPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />
      <View style={styles.kaiCardContainer}>
        <View style={styles.kaiCard}>
          <Image
            style={[styles.cardBackground, {width: viewportWidth - 40}]}
            source={require('../../assets/card_background.png')}
            // source={require('../../assets/test.jpg')}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <View>{renderIcon(tokenAvatar)}</View>
            <TouchableOpacity onPress={() => removeToken(tokenAddress)}>
              <Image
                source={require('../../assets/icon/remove_dark.png')}
                style={{width: 24, height: 24}}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}>
            <View>
              <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 10, lineHeight: 16}}>
                {getLanguageString(language, 'BALANCE').toUpperCase()}
              </CustomText>
              <CustomText style={{fontSize: 24, color: 'white', fontWeight: 'bold'}}>
                {numeral(
                  parseDecimals(Number(tokenBalance), tokenDecimals),
                ).format('0,0.00')}{' '}
                {tokenSymbol}
              </CustomText>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddressQR(true)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 2,
                shadowRadius: 4,
                elevation: 9,
              }}>
              <Image
                source={require('../../assets/icon/qr_dark.png')}
                style={{width: 30, height: 30, marginRight: 2, marginTop: 2}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{flex: 3, width: '100%', paddingVertical: 12}}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingHorizontal: 20,
          }}>
          <CustomText style={{fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'}}>
            {getLanguageString(language, 'RECENT_TRANSACTION')}
          </CustomText>
        </View>
        <TokenTxList
          tokenAddress={tokenAddress}
          tokenAvatar={tokenAvatar}
          tokenSymbol={tokenSymbol}
          tokenDecimals={tokenDecimals}
        />
      </View>
    </SafeAreaView>
  );
};

export default TokenDetail;
