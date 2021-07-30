/* eslint-disable react-native/no-inline-styles */
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Image,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { LogBox } from 'react-native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import {showTabBarAtom} from '../../atoms/showTabBar';
import Button from '../../components/Button';
import Divider from '../../components/Divider';
import {getTxDetail} from '../../services/transaction';
import {getTxDetail as getKRC20TxDetail} from '../../services/krc20';
import {ThemeContext} from '../../ThemeContext';
import {getDateFNSLocale, getLanguageString} from '../../utils/lang';
import {copyToClipboard, getTxURL, truncate} from '../../utils/string';
import {styles} from './style';
import {formatNumberString, parseDecimals} from '../../utils/number';
import TextAvatar from '../../components/TextAvatar';
import CustomText from '../../components/Text';
import Toast from 'react-native-toast-message';
import { statusBarColorAtom } from '../../atoms/statusBar';

LogBox.ignoreLogs([
 'Non-serializable values were found in the navigation state',
]);

export default () => {
  const {params} = useRoute();
  const navigation = useNavigation();

  const fromHome = params ? (params as any).fromHome : false;
  const txHash = params ? (params as any).txHash : '';
  const type = params ? (params as any).type : 'normal';
  const userAddress = params ? (params as any).userAddress : '';
  const tokenAddress = params ? (params as any).tokenAddress : '';
  const tokenSymbol = params ? (params as any).tokenSymbol : '';
  const tokenAvatar = params ? (params as any).tokenAvatar : '';
  const tokenDecimals = params ? (params as any).tokenDecimals : -1;
  const validatorItem: Validator = params ? (params as any).validatorItem : {};
  const claimAmount = params ? (params as any).claimAmount : '';
  const undelegateAmount = params ? (params as any).undelegateAmount : '';
  const withdrawAmount = params ? (params as any).withdrawAmount : '';
  const dexMode = params ? (params as any).dexMode : '';
  const dexAmount = params ? (params as any).dexAmount : '';
  const pairAddress = params ? (params as any).pairAddress : '';
  const pairItem = params ? (params as any).pairItem : {};
  const lpPair: Pair = params ? (params as any).lpPair : {}
  const token0 = params ? (params as any).token0 : ''
  const token1 = params ? (params as any).token1 : ''
  const refreshLP = params ? (params as any).refreshLP : () => {}
  
  const theme = useContext(ThemeContext);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const language = useRecoilValue(languageAtom);
  const dateLocale = getDateFNSLocale(language);

  // const [receiver, setReceiver] = useState('');
  const [address, setAddress] = useState<Record<string, any>>({});
  const [txObj, setTxObj] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const addressBook = useRecoilValue(addressBookAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const handleClickLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      console.log('Success Tx', txHash)
      while (true) {
        let tx: Record<string, any> = {};

        try {
          if (type === 'krc20') {
            tx = await getKRC20TxDetail(tokenAddress, userAddress, txHash);
          } else {
            tx = await getTxDetail(txHash);
          } 
        } catch (error) {
          console.log('No receipt found')
        }

        if (tx && tx.hash) {
          const rs = addressBook.filter((item) => item.address === tx.to);
          setAddress(rs[0] || {});
          setTxObj(tx);
          setLoading(false);
          break;
        }
      }
    })();
  }, [addressBook, tokenAddress, txHash, type, userAddress]);

  const renderAmount = () => {
    switch (type) {
      case 'normal':
      case 'delegate':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, marginRight: 12}}>
              {formatNumberString(txObj.amount)}
            </CustomText>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 18}}>
              KAI
            </CustomText>
          </View>
        );
      case 'krc20':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, marginRight: 12}}>
              {parseDecimals(txObj.value, tokenDecimals)}
            </CustomText>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 18}}>
              {tokenSymbol}
            </CustomText>
          </View>
        );
      case 'claim':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, marginRight: 12}}>
              {formatNumberString(claimAmount, 6)}
            </CustomText>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 18}}>
              KAI
            </CustomText>
          </View>
        );
      case 'withdraw':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, marginRight: 12}}>
              {formatNumberString(withdrawAmount)}
            </CustomText>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 18}}>
              KAI
            </CustomText>
          </View>
        );
      case 'undelegate':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, marginRight: 12}}>
              {formatNumberString(undelegateAmount)}
            </CustomText>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 18}}>
              KAI
            </CustomText>
          </View>
        );
      case 'dex':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, marginRight: 12}}>
              {formatNumberString(dexAmount, 6)}
            </CustomText>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 18}}>
              {tokenSymbol}
            </CustomText>
          </View>
        )
      case 'addLP':
      case 'withdrawLP':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                padding: 16,
                backgroundColor: theme.backgroundStrongColor,
                borderRadius: 12,
                marginRight: 4,
                flex: 1
              }}
            >
              <Image
                source={{uri: lpPair.t1.logo}}
                style={{
                  width: 28,
                  height: 28,
                  marginBottom: 8
                }}
              />
              <CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 8, fontWeight: 'bold'}}>{formatNumberString(token0, 6)}</CustomText>
            </View>
            <View
              style={{
                padding: 16,
                backgroundColor: theme.backgroundStrongColor,
                borderRadius: 12,
                marginLeft: 4,
                flex: 1
              }}
            >
              <Image
                source={{uri: lpPair.t2.logo}}
                style={{
                  width: 28,
                  height: 28,
                  marginBottom: 8
                }}
              />
              <CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 8, fontWeight: 'bold'}}>{formatNumberString(token1, 6)}</CustomText>
            </View>
          </View>
        )
      default:
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, marginRight: 12}}>
              {formatNumberString(txObj.amount)}
            </CustomText>
            <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 18}}>
              KAI
            </CustomText>
          </View>
        );
    }
  };

  const renderReceiver = () => {
    switch (type) {
      case 'normal':
        return (
          <View style={styles.addressContainer}>
            <View
              style={{
                width: 48,
                height: 48,
                marginRight: 12,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.backgroundColor,
              }}>
              <Image
                style={{width: 48, height: 48}}
                source={
                  address.avatar
                    ? {uri: address.avatar}
                    : require('../../assets/icon/user.png')
                }
              />
            </View>
            <View>
              <CustomText
                style={[
                  styles.addressName,
                  {color: theme.textColor, fontSize: 13},
                ]}>
                {address.name
                  ? address.name
                  : getLanguageString(language, 'NEW_CONTACT')}
              </CustomText>
              <CustomText
                style={[
                  styles.addressHash,
                  {
                    color: 'rgba(252, 252, 252, 0.54)',
                    fontSize: theme.defaultFontSize,
                  },
                ]}>
                {truncate(txObj.to, 15, 15)}
              </CustomText>
            </View>
          </View>
        );
      case 'delegate':
      case 'claim':
      case 'undelegate':
      case 'withdraw':
        return (
          <View style={styles.addressContainer}>
            <TextAvatar
              text={validatorItem.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                marginRight: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              textStyle={{fontSize: 16}}
            />
            <View style={{justifyContent: 'space-between'}}>
              <CustomText
                style={[
                  styles.addressName,
                  {color: theme.textColor, fontSize: 13},
                ]}>
                {validatorItem.name}
              </CustomText>
              <CustomText
                style={[
                  styles.commissionRateText,
                  {
                    color: 'rgba(252, 252, 252, 0.54)',
                    fontSize: theme.defaultFontSize,
                  },
                ]}>
                Rate: {validatorItem.commissionRate} %
              </CustomText>
            </View>
          </View>
        );
      case 'dex':
      case 'addLP':
      case 'withdrawLP':
        return null;
      default:
        return (
          <View style={styles.addressContainer}>
            <View
              style={{
                width: 48,
                height: 48,
                marginRight: 12,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.backgroundColor,
              }}>
              <Image
                style={{width: 48, height: 48, borderRadius: 12}}
                source={
                  address.avatar
                    ? {uri: address.avatar}
                    : require('../../assets/icon/user.png')
                }
              />
            </View>
            <View style={{justifyContent: 'space-between', height: 48, paddingVertical: 4}}>
              <CustomText
                style={[
                  styles.addressName,
                  {color: theme.textColor, fontSize: 13},
                ]}>
                {address.name
                  ? address.name
                  : getLanguageString(language, 'NEW_CONTACT')}
              </CustomText>
              <CustomText
                style={[
                  styles.addressHash,
                  {
                    color: 'rgba(252, 252, 252, 0.54)',
                    fontSize: theme.defaultFontSize,
                  },
                ]}>
                {truncate(txObj.to, 15, 15)}
              </CustomText>
            </View>
          </View>
        );
    }
  };

  const renderSuccessDesc = () => {
    if (txObj.status === 0) {
      return getLanguageString(language, 'GENERAL_FAIL_DESC');
    }
    switch (type) {
      case 'normal':
        return getLanguageString(language, 'TX_SUCCESS');
      case 'delegate':
        return getLanguageString(language, 'DELEGATE_SUCCESS');
      case 'claim':
        return getLanguageString(language, 'CLAIM_SUCCESS').replace(/{{KAI_AMOUNT}}/g, formatNumberString(claimAmount, 6));
      case 'undelegate':
        return getLanguageString(language, 'UNDELEGATE_SUCCESS').replace(/{{KAI_AMOUNT}}/g, formatNumberString(undelegateAmount));
      case 'withdraw': 
        return getLanguageString(language, 'WITHDRAW_SUCCESS').replace(/{{KAI_AMOUNT}}/g, formatNumberString(withdrawAmount))
      case 'dex':
        return getLanguageString(language, 'DEX_TX_SUCCESS')
                .replace(/{{TOKEN_AMOUNT}}/g, formatNumberString(dexAmount, 6))
                .replace(/{{DEX_MODE}}/g, getLanguageString(language, dexMode))
                .replace(/{{TOKEN_SYMBOL}}/g, tokenSymbol)
      case 'addLP':
        return getLanguageString(language, 'ADD_LP_SUCCESS')
      case 'withdrawLP':
        return getLanguageString(language, 'WITHDRAW_LP_SUCCESS')
      default:
        return getLanguageString(language, 'TX_SUCCESS');
    }
  };

  const handleBack = async () => {
    switch (type) {
      case 'normal':
        navigation.goBack()
        break;
      case 'delegate':
      case 'claim':
      case 'undelegate':
      case 'withdraw':
        navigation.reset({
          index: 0,
          routes: [{name: 'Staking'}],
        });
        break;
      case 'krc20':
        const routes: any[] = [{name: 'HomeScreen'}]
        if (!fromHome) {
          routes.push({
            name: 'TokenDetail', 
            params: {
              symbol: tokenSymbol,
              tokenAddress,
              decimals: tokenDecimals,
              avatar: tokenAvatar,
            }
          })
        }
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              state: {
                routes,
              }
            }
          ],
        });
        break;
      case 'dex':
        
        if (pairItem && pairItem.contract_address) {
          navigation.reset({
            index: 1,
            routes: [{name: 'Trade'}, {name: 'PairDetail', params: {pairItem}}],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'Trade', params: {pairAddress}}],
          });
        }
        
        break;
      case 'addLP':
      case 'withdrawLP':
        refreshLP()
        navigation.goBack()
        break;
      default:
        navigation.goBack()
        break;
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <ActivityIndicator color={theme.textColor} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={{flex: 1, width: '100%', alignItems: 'center'}}>
        <View
          style={{
            // marginTop: 95,
            width: '100%',
            height: 272,
          }}>
          <ImageBackground
            imageStyle={{resizeMode: 'contain'}}
            style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end'}}
            source={txObj.status !== 0 ? require('../../assets/success_tx.png') : require('../../assets/fail_tx.png')}>
            <Image
              style={{width: 86, height: 86}}
              source={txObj.status !== 0 ? require('../../assets/icon/success_tx_icon.png') : require('../../assets/icon/fail_tx_icon.png')}
            />
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, fontWeight: 'bold'}}>
              {getLanguageString(language, txObj.status !== 0 ? 'SUCCESS' : 'FAIL')}
            </CustomText>
            <CustomText style={{color: theme.textColor, fontSize: 15, marginTop: 8, textAlign: 'center', paddingHorizontal: 18}}>
              {renderSuccessDesc()}
            </CustomText>
          </ImageBackground>
        </View>
        {renderReceiver()}
        <Divider
          style={{width: 280, backgroundColor: '#60636C', marginVertical: 32}}
        />
        <CustomText style={{textAlign: 'center', color: theme.textColor, fontSize: 15}}>
          {getLanguageString(language, 'TRANSACTION_AMOUNT')}
        </CustomText>
        {renderAmount()}
        <CustomText style={{fontSize: 15, color: 'rgba(252, 252, 252, 0.54)'}}>
          {txObj.date &&
            format(txObj.date, 'MMM dd, yyyy - hh:mm aa', {
              locale: dateLocale,
            })}
        </CustomText>
        <View style={{backgroundColor: '#212121', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginTop: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
          <CustomText style={{color: theme.textColor}}>
            {truncate(txObj.hash, 16, 16)}
          </CustomText>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => {
              copyToClipboard(txObj.hash)
              Toast.show({
                type: 'success',
                topOffset: 70,
                text1: getLanguageString(language, 'COPIED'),
              });
            }}>
              <Image source={require('../../assets/icon/copy.png')} style={{width: 16, height: 16, marginRight: 12}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleClickLink(getTxURL(txObj.hash))}>
              <Image source={require('../../assets/icon/external_url_dark.png')} style={{width: 16, height: 16}} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Button
        title={getLanguageString(language, 'OK_TEXT')}
        onPress={handleBack}
        block
        style={{marginBottom: 82}}
        textStyle={{
          fontWeight: '500', 
          fontSize: theme.defaultFontSize + 4,
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
        }}
      />
    </View>
  );
};
