/* eslint-disable react-native/no-inline-styles */
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Image, TouchableOpacity, View, Dimensions, Platform} from 'react-native';
import ENIcon from 'react-native-vector-icons/Entypo';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {krc20ListAtom} from '../../atoms/krc20';
import {languageAtom} from '../../atoms/language';
import {DEFAULT_KRC20_TOKENS} from '../../config';
import {getBalance} from '../../services/krc20';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import Modal from '../../components/Modal';
import {
  getSelectedWallet,
  getTokenList,
  getWallets,
  saveTokenList,
} from '../../utils/local';
import {formatNumberString, parseDecimals} from '../../utils/number';
import KRC20AddressQRModal from '../common/KRC20AddressQRCode';
import {styles} from './style';
import TokenTxList from './TokenTxList';
import {showTabBarAtom} from '../../atoms/showTabBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/Text';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import KRC20ControlSection from './KRC20ControlSection';
import Button from '../../components/Button';

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
  const tokenName = params ? (params as Record<string, any>).name : '';

  const language = useRecoilValue(languageAtom);

  const [showAddressQR, setShowAddressQR] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
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

  const renderHideDesc = () => {
    const strArr = getLanguageString(language, 'CONFIRM_REMOVE_TOKEN').split('{{SPLIT_HERE}}')
    return (
      <CustomText
        style={{
          textAlign: 'center',
          fontSize: 15,
          marginBottom: 36,
          color: theme.mutedTextColor,
          lineHeight: 26
        }}>
        {strArr[0]}
        <CustomText
          style={{
            color: theme.textColor,
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        >
          [{tokenName} ({tokenSymbol})]
        </CustomText>
        {strArr[1]}
      </CustomText>
    )
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <KRC20AddressQRModal
        visible={showAddressQR}
        onClose={() => setShowAddressQR(false)}
        tokenSymbol={tokenSymbol}
        tokenDecimals={tokenDecimals}
        tokenBalance={tokenBalance}
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
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%'
            }}>
            <TouchableOpacity 
              style={{
                position: 'absolute',
                left: 0
              }}
              onPress={() => setShowRemoveConfirm(true)}>
              <Image
                source={require('../../assets/icon/hide_dark.png')}
                style={{width: 24, height: 24}}
              />
            </TouchableOpacity>
            <View>{renderIcon(tokenAvatar)}</View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}>
            <View>
              <CustomText style={{fontSize: 24, color: 'white', fontWeight: 'bold', textAlign: 'center'}}>
                {formatNumberString(
                  parseDecimals(tokenBalance, tokenDecimals),
                  6
                )}{' '}
                {tokenSymbol}
              </CustomText>
            </View>
          </View>
          <View
            style={{
              width: '100%',
            }}
          >
            <KRC20ControlSection
              tokenAddress={tokenAddress}
              tokenAvatar={tokenAvatar}
              tokenSymbol={tokenSymbol}
              tokenDecimals={tokenDecimals}
            />
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
      <Modal
        visible={showRemoveConfirm}
        showCloseButton={false}
        onClose={() => setShowRemoveConfirm(false)}
        contentStyle={{
          backgroundColor: theme.backgroundFocusColor,
          height: 370,
          justifyContent: 'center',
        }}>
        <CustomText
          style={{
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 12,
            color: theme.textColor,
          }}>
        {getLanguageString(language, 'REMOVE_TOKEN')}
        </CustomText>
        {renderHideDesc()}
        <Button
          block
          title={getLanguageString(language, 'KEEP_IT')}
          type="outline"
          textStyle={{
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontSize: theme.defaultFontSize + 3
          }}
          onPress={() => setShowRemoveConfirm(false)}
        />
        <Button
          block
          title={getLanguageString(language, 'HIDE_NOW')}
          type="ghost"
          style={{
            marginTop: 12,
            backgroundColor: 'rgba(208, 37, 38, 1)',
          }}
          textStyle={{
            color: '#FFFFFF',
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontSize: theme.defaultFontSize + 3
          }}
          onPress={() => removeToken(tokenAddress)}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default TokenDetail;
