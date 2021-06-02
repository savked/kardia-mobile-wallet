/* eslint-disable react-native/no-inline-styles */
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  Text,
  View,
  Image,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
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

export default () => {
  const {params} = useRoute();
  const navigation = useNavigation();

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
  
  const theme = useContext(ThemeContext);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const language = useRecoilValue(languageAtom);
  const dateLocale = getDateFNSLocale(language);

  // const [receiver, setReceiver] = useState('');
  const [address, setAddress] = useState<Record<string, any>>({});
  const [txObj, setTxObj] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const addressBook = useRecoilValue(addressBookAtom);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      while (true) {
        let tx: Record<string, any>;
        if (type === 'krc20') {
          tx = await getKRC20TxDetail(tokenAddress, userAddress, txHash);
        } else {
          tx = await getTxDetail(txHash);
          
        }
        if (tx && tx.hash) {
          // console.log('tx mined')
          const rs = addressBook.filter((item) => item.address === tx.to);
          setAddress(rs[0] || {});
          setTxObj(tx);
          setLoading(false);
          break;
        }
        // console.log('tx not mined', txHash)
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
      default:
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
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
      default:
        return getLanguageString(language, 'TX_SUCCESS');
    }
  };

  const handleBack = () => {
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
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              state: {
                routes: [{name: 'HomeScreen'}, {name: 'TokenDetail', params: {
                  symbol: tokenSymbol,
                  tokenAddress,
                  decimals: tokenDecimals,
                  avatar: tokenAvatar,
                }}],
              }
            }
          ],
        });
        break;
      case 'dex':
        navigation.reset({
          index: 0,
          routes: [{name: 'DEX', params: {pairAddress}}],
        });
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
            source={require('../../assets/success_tx.png')}>
            <Image
              style={{width: 86, height: 86}}
              source={require('../../assets/icon/success_tx_icon.png')}
            />
            <CustomText
              allowFontScaling={false}
              style={{color: theme.textColor, fontSize: 32, fontWeight: 'bold'}}>
              {getLanguageString(language, 'SUCCESS')}
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
