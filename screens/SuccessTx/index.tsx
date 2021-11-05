/* eslint-disable react-native/no-inline-styles */
import {
    useFocusEffect,
    useNavigation,
    useRoute
} from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Dimensions, Image,
    ImageBackground,

    Linking, LogBox, Platform, TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { addressBookAtom } from '../../atoms/addressBook';
import { languageAtom } from '../../atoms/language';
import { pendingTxBackgroundAtom, pendingTxSelector } from '../../atoms/pendingTx';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { statusBarColorAtom } from '../../atoms/statusBar';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import Button from '../../components/Button';
import Divider from '../../components/Divider';
import CustomText from '../../components/Text';
import TextAvatar from '../../components/TextAvatar';
import { getTxDetail as getKRC20TxDetail } from '../../services/krc20';
import { getTxDetail } from '../../services/transaction';
import { ThemeContext } from '../../ThemeContext';
import { getDateFNSLocale, getLanguageString } from '../../utils/lang';
import { formatNumberString, parseDecimals } from '../../utils/number';
import { sleep } from '../../utils/promiseHelper';
import { copyToClipboard, getAddressURL, getTxURL, truncate } from '../../utils/string';
import { styles } from './style';

LogBox.ignoreLogs([
 'Non-serializable values were found in the navigation state',
 "Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.",
 'Sending `onAnimatedValueUpdate` with no listeners registered.'
]);

const {width: viewportWidth} = Dimensions.get('window')

let interval: any

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
  const orderID = params ? (params as any).orderID : ''
  const refreshLimitOrders = params ? (params as any).refreshLimitOrders : () => {}
  const otherChainName = params ? (params as any).otherChainName : ''
  const otherChainLogo = params ? (params as any).otherChainLogo : ''
  const otherChainReceiver = params ? (params as any).otherChainReceiver : ''
  const swapAmount = params ? (params as any).swapAmount : ''
  
  const theme = useContext(ThemeContext);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const language = useRecoilValue(languageAtom);
  const dateLocale = getDateFNSLocale(language);

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const setPendingTx = useSetRecoilState(pendingTxSelector(wallets[selectedWallet].address))
  const [pendingTxBackground, setPendingTxBackground] = useRecoilState(pendingTxBackgroundAtom)

  // const [receiver, setReceiver] = useState('');
  const [address, setAddress] = useState<Record<string, any>>({});
  const [txObj, setTxObj] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const [backing, setBacking] = useState(false);

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

      if (pendingTxBackground) {
        if (interval) clearInterval(interval);
        handleBack(false);
        return
      };

      let found = false

      const handler = async () => {
        let tx: Record<string, any> = {};

        try {
          if (type === 'krc20') {
            tx = await getKRC20TxDetail(tokenAddress, userAddress, txHash);
          } else {
            tx = await getTxDetail(txHash);
          } 
        } catch (error) {
          // console.log('No receipt found')
        }

        if (tx && tx.hash) {
          found = true
          const rs = addressBook.filter((item) => item.address === tx.to);
          setAddress(rs[0] || {});
          setTxObj(tx);
          setLoading(false);
          if (interval) clearInterval(interval);
        }
      }
      await handler()
      if (!found) {
        interval = setInterval(handler, 1000)
      }

      return () => interval && clearInterval(interval)
    })();
  }, [addressBook, tokenAddress, txHash, type, userAddress, pendingTxBackground]);

  useEffect(() => {
    if (!loading) return;

    setTimeout(() => {
      let nextIndex = textIndex === 5 ? 1 : textIndex + 1;
      setTextIndex(nextIndex)
    }, 5000)

  }, [loading, textIndex])

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
      case 'dexLimit':
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
      case 'dexLimitCancelOrder':
        return null;
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
      case 'crosschainSwap':
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
              {formatNumberString(swapAmount)}
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
            <View style={{backgroundColor: 'red'}}>
              <CustomText
                style={[
                  styles.addressName,
                  {color: theme.textColor, fontSize: 13},
                ]}>
                {address.name
                  ? address.name
                  : getLanguageString(language, 'NEW_CONTACT')}
              </CustomText>
              <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <CustomText
                  style={[
                    styles.addressHash,
                    {
                      color: 'rgba(252, 252, 252, 0.54)',
                      fontSize: theme.defaultFontSize,
                      marginRight: 8
                    },
                  ]}>
                  {truncate(txObj.to, 15, 15)}
                </CustomText>
                <TouchableOpacity onPress={() => handleClickLink(getTxURL(txObj.hash))}>
                  <Image source={require('../../assets/icon/external_url_dark.png')} style={{width: 16, height: 16}} />
                </TouchableOpacity>
              </View>
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
      case 'dexLimit':
      case 'addLP':
      case 'withdrawLP':
      case 'dexLimitCancelOrder':
        return null;
      case 'crosschainSwap':
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
                source={{uri: otherChainLogo}}
              />
            </View>
            <View style={{justifyContent: 'space-between', height: 48, paddingVertical: 4}}>
              <CustomText
                style={[
                  styles.addressName,
                  {color: theme.textColor, fontSize: 13},
                ]}>
                {otherChainName}
              </CustomText>
              <CustomText
                style={[
                  styles.addressHash,
                  {
                    color: 'rgba(252, 252, 252, 0.54)',
                    fontSize: theme.defaultFontSize,
                  },
                ]}>
                {truncate(otherChainReceiver, 15, 15)}
              </CustomText>
            </View>
          </View>
        )
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
              <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <CustomText
                  style={[
                    styles.addressHash,
                    {
                      color: 'rgba(252, 252, 252, 0.54)',
                      fontSize: theme.defaultFontSize,
                      marginRight: 8
                    },
                  ]}>
                  {truncate(txObj.to, 15, 15)}
                </CustomText>
                <TouchableOpacity onPress={() => handleClickLink(getAddressURL(txObj.to))}>
                  <Image source={require('../../assets/icon/external_url_dark.png')} style={{width: 16, height: 16}} />
                </TouchableOpacity>
              </View>
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
      case 'dexLimit':
        return getLanguageString(language, 'LIMIT_ORDER_CREATED');
      case 'dexLimitCancelOrder':
        return getLanguageString(language, 'ORDER_CANCELLED').replace(/{{ORDER_ID}}/g, orderID)
      case 'addLP':
        return getLanguageString(language, 'ADD_LP_SUCCESS')
      case 'withdrawLP':
        return getLanguageString(language, 'WITHDRAW_LP_SUCCESS')
      case 'crosschainSwap':
        return getLanguageString(language, 'CROSS_CHAIN_SWAP_SUCCESS');
      default:
        return getLanguageString(language, 'TX_SUCCESS');
    }
  };

  const handleBack = async (success = true) => {
    if (wallets[selectedWallet].address && success) {
      setPendingTx('')
    }
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
      case 'dexLimit':
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
      case 'dexLimitCancelOrder':
        setBacking(true)
        await sleep(1000)
        setBacking(false)
        refreshLimitOrders();
        navigation.goBack()
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

  const renderLoadingText = () => {
    if (!loading) return null;
    const textArr = [
      getLanguageString(language, 'LOADING_TEXT_1'),
      getLanguageString(language, 'LOADING_TEXT_2'),
      getLanguageString(language, 'LOADING_TEXT_3'),
      getLanguageString(language, 'LOADING_TEXT_4'),
      getLanguageString(language, 'LOADING_TEXT_5'),
      getLanguageString(language, 'LOADING_TEXT_6')
    ]

    return (
      <CustomText 
        style={{
          color: theme.mutedTextColor, 
          fontSize: theme.defaultFontSize + 4,
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: 12
        }}
      >
        {textArr[textIndex]}...
      </CustomText>
    )
  }

  if (loading) {

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundColor,
            // backgroundColor: 'red',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        {/* <ActivityIndicator color={theme.textColor} size="large" /> */}
        <Image
          source={require('../../assets/loading.gif')}
          style={{
            // flex: 1
            width: 160,
            height: 152
          }}
        />
        <CustomText
          style={{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 8,
            fontWeight: 'bold',
            marginTop: 24
          }}
        >
          {getLanguageString(language, 'LOADING_TITLE_TEXT')}
        </CustomText>
        {renderLoadingText()}
        <Button
          title={'Hide'}
          onPress={() => {
            setPendingTxBackground(true)
            // handleBack(false)
          }}
          type="outline"
          block
          style={{
            bottom: 60,
            position: 'absolute'
          }}
          textStyle={{fontSize: theme.defaultFontSize + 3}}
        />
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
        {
          renderAmount() !== null &&
          <CustomText style={{textAlign: 'center', color: theme.textColor, fontSize: 15}}>
            {getLanguageString(language, 'TRANSACTION_AMOUNT')}
          </CustomText>
        }
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
      <View style={{paddingBottom: 82}}>
        <Button
          title={getLanguageString(language, 'OK_TEXT')}
          loading={backing}
          onPress={handleBack}
          block
          
          textStyle={{
            fontWeight: '500', 
            fontSize: theme.defaultFontSize + 4,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        />
      </View>
    </View>
  );
};
