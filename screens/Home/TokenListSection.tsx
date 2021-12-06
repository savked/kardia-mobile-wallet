/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Linking, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { filterByOwnerSelector } from '../../atoms/krc20';
import { languageAtom } from '../../atoms/language';
import { tokenInfoAtom } from '../../atoms/token';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import Button from '../../components/Button';
import CustomText from '../../components/Text';
import { SIMPLEX_URL } from '../../services/config';
import { getBalance } from '../../services/krc20';
import { weiToKAI } from '../../services/transaction/amount';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { formatNumberString, parseDecimals } from '../../utils/number';
// import List from '../../components/List';
import { styles } from './style';

const TokenListSection = ({refreshTime, hideBalance}: {
  refreshTime: number,
  hideBalance: boolean
}) => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const wallets = useRecoilValue(walletsAtom)
  const tokenInfo = useRecoilValue(tokenInfoAtom);

  const language = useRecoilValue(languageAtom);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string[]>([]);
  // const tokenList = useRecoilValue(krc20ListAtom);
  const tokenList = useRecoilValue(filterByOwnerSelector(wallets[selectedWallet].address))

  const updateBalanceAll = async () => {
    setLoading(true);
    const promiseArr = tokenList.map((i) => {
      return getBalance(i.address, wallets[selectedWallet].address);
    });
    const balanceArr = await Promise.all(promiseArr);
    setBalance(balanceArr);
    setLoading(false);
  }

  useEffect(() => {
    updateBalanceAll();
  }, [tokenList, selectedWallet, refreshTime]);

  const renderIcon = (avatar: string) => {
    return (
      <View style={{flex: 0.3, marginRight: 12}}>
        <View
          style={{
            width: 30,
            height: 30,

            borderRadius: 15,
            backgroundColor: 'white',

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            borderWidth: 1,
            borderColor: 'gray',
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
      </View>
    );
  };

  const renderTokenList = () => {
    // return tokenList.slice(0, 7).map((item, index) => {
    return tokenList.map((item, index) => {
      return <View
        key={item.address}
        style={{
          padding: 15,
          marginHorizontal: 20,
          borderRadius: 8,
          marginVertical: 6,
          backgroundColor: theme.backgroundFocusColor,
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
          onPress={() => {
            navigation.navigate('Home', {
              screen: 'TokenDetail',
              initial: false,
              params: {
                tokenAddress: item.address,
                name: item.name,
                symbol: item.symbol,
                avatar: item.avatar,
                decimals: item.decimals,
                // balance: balance[index],
              },
            });
          }}>
          {renderIcon(item.avatar || '')}
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              height: '100%',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: 16,
              }}>
              {item.symbol}
            </CustomText>
          </View>
          <View
            style={{
              flex: 1,
              // flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}>
            <CustomText style={[styles.kaiAmount, {color: theme.textColor}]}>
              {!hideBalance ? (formatNumberString(parseDecimals(balance[index],
                 item.decimals), 2)) : '*****'}
            </CustomText>
            <CustomText style={{color: theme.ghostTextColor}}>
              {item.symbol}
            </CustomText>
          </View>
        </TouchableOpacity>
      </View>
    })
  }

  const _getBalance = () => {
    if (!wallets[selectedWallet]) return '0';
    return wallets[selectedWallet].balance;
  }

  return (
    <View style={styles.tokenListContainer}>
      {/* <NewTokenModal visible={showModal} onClose={() => setShowModal(false)} /> */}
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}>
        <CustomText style={{fontSize: 18, fontWeight: 'bold', color: theme.textColor}}>
          {getLanguageString(language, 'KRC20_TOKENS_SECTION_TITLE')}
        </CustomText>
        <TouchableOpacity onPress={() => navigation.navigate('KRC20Tokens')}>
          <CustomText style={{fontSize: theme.defaultFontSize, color: theme.textColor}}>
            {getLanguageString(language, 'VIEW_ALL')} ({tokenList.length + 1})
          </CustomText>
        </TouchableOpacity>
      </View>
      <ImageBackground
        source={require('../../assets/kai_balance_outline.png')}
        imageStyle={{
          resizeMode: 'cover',
          borderRadius: 12,
        }}
        style={{
          flex: 1,
          marginHorizontal: 20,
          marginBottom: 4
        }}
      >
        <View
          style={{
            padding: 16,
            margin: 1.5,
            backgroundColor: theme.backgroundStrongColor,
            borderRadius: 12,
            // marginHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <Image
              style={{width: 32, height: 32, marginRight: 12}}
              source={require('../../assets/logo_dark.png')}
            />
            <View>
              <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 12}}>
                {getLanguageString(language, 'BALANCE').toUpperCase()}
              </CustomText>
              <CustomText style={{color: theme.textColor, fontSize: 18, marginVertical: 4, fontWeight: 'bold'}}>
                { !hideBalance ? (formatNumberString(weiToKAI(_getBalance()), 2, 0)) : '*****'}{' '}
                <CustomText style={{color: theme.mutedTextColor, fontWeight: '500'}}>KAI</CustomText>
              </CustomText>
              <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 12}}>
                {!hideBalance ? ('$' + formatNumberString(
                  (tokenInfo.price *
                    Number(weiToKAI(_getBalance()))).toString(),
                  2,
                  0
                )) : '*****'}
              </CustomText>
            </View>
          </View>
          <Button
            title={getLanguageString(language, 'BUY_KAI')}
            // onPress={() => Alert.alert('Coming soon')}
            onPress={() => Linking.openURL(SIMPLEX_URL)}
            type="ghost"
            size="small"
            textStyle={Platform.OS === 'android' ? {color: '#000000', fontFamily: 'WorkSans-SemiBold'} : {color: '#000000', fontWeight: '500'}}
            style={{paddingHorizontal: 16, paddingVertical: 8}}
          />
        </View>
      </ImageBackground>
      {loading ? <ActivityIndicator color={theme.textColor} size="large" /> : (
        renderTokenList()
      )}
    </View>
  );
};

export default TokenListSection;
