/* eslint-disable react-native/no-inline-styles */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ENIcon from 'react-native-vector-icons/Entypo';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { statusBarColorAtom } from '../../atoms/statusBar';
import CustomText from '../../components/Text';
import { getKRC20TokenInfo } from '../../services/krc20';
import { getTxByAddress } from '../../services/transaction';
import { ThemeContext } from '../../ThemeContext';
import { groupByDate } from '../../utils/date';
import { getDateFNSLocale, getLanguageString } from '../../utils/lang';
import { getSelectedWallet, getWallets } from '../../utils/local';
import { formatNumberString, parseDecimals } from '../../utils/number';
import { truncate } from '../../utils/string';
import { isKRC20Tx } from '../../utils/transaction';
import TxDetailModal from '../common/TxDetailModal';
import { styles } from './style';

const TransactionScreen = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gettingMore, setGettingMore] = useState(false);
  const [haveMore, setHaveMore] = useState(false);

  const [searchString, setSearchString] = useState('');
  const [txList, setTxList] = useState([] as any[]);
  const language = useRecoilValue(languageAtom);

  const [showTxDetail, setShowTxDetail] = useState(false);
  const [txObjForDetail, setTxObjForDetail] = useState();
  const [page, setPage] = useState(1)

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const insets = useSafeAreaInsets();

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 550;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const getTX = async (page: number) => {
    let shouldFetch = false
    if (page === 1 || !gettingMore) {
      shouldFetch = true
    }
    if (!shouldFetch) {
      return;
    }
    const SIZE = 30;
    const localWallets = await getWallets();
    const localSelectedWallet = await getSelectedWallet();
    if (
      !localWallets[localSelectedWallet] ||
      !localWallets[localSelectedWallet].address
    ) {
      return;
    }
    try {
      const {haveMore: _haveMore, data: newTxList} = await getTxByAddress(
        localWallets[localSelectedWallet].address,
        page,
        SIZE,
      );
      if (page === 1) {
        const rs = await Promise.all(newTxList.map(async (i: any) => await parseTXForList(i, localWallets[localSelectedWallet].address)))
        setTxList(rs);
      } else {
        const rs = await Promise.all(newTxList.map(async (i: any) => await parseTXForList(i, localWallets[localSelectedWallet].address)))
        setTxList([...txList, ...rs]);
      }
      setHaveMore(_haveMore);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor);
      setLoading(true);
      setPage(1)
      getTX(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      setGettingMore(true);
      await getTX(page);
      setGettingMore(false)
    })()
  }, [page])

  const parseTXForList = async (tx: Record<string, any>, address: string) => {
    let to = tx.to
    let symbol = ''
    let decimals = 18
    let amount = tx.amount
    
    const isKRC20 = isKRC20Tx(tx)
    if (isKRC20) {
      to = tx.decodedInputData.arguments._receiver
      const tokenInfo = await getKRC20TokenInfo(tx.to)
      symbol = tokenInfo.symbol
      decimals = tokenInfo.decimals
      amount = tx.decodedInputData.arguments._amount
    }
    
    return {
      label: tx.hash,
      value: tx.hash,
      isKRC20,
      amount,
      date: tx.date,
      from: tx.from,
      to,
      toName: tx.toName,
      decimals,
      hash: tx.hash,
      txFee: tx.fee || tx.txFee,
      blockHash: tx.blockHash || '',
      blockNumber: tx.blockNumber || '',
      status: tx.status,
      symbol,
      type:
        tx.from === address
          ? 'OUT'
          : 'IN',
    };
  };

  const renderIcon = (status: number, type: 'IN' | 'OUT') => {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            width: 32,
            height: 32,

            borderRadius: 12,
            backgroundColor: theme.backgroundColor,

            // flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            // borderWidth: 1,
            // borderColor: 'gray',
          }}>
          {type === 'IN' ? (
            <Image
              source={require('../../assets/icon/receive.png')}
              style={styles.kaiLogo}
            />
          ) : (
            <Image
              source={require('../../assets/icon/send.png')}
              style={styles.kaiLogo}
            />
          )}
        </View>
        {status === 0 && (
          // <Image source={require('../../assets/icon/warning.png')} style={{width: 14, height: 14, position: 'absolute', right: 3, top: -2}} />
          <CustomText style={{position: 'absolute', right: 0, top: -4, fontSize: theme.defaultFontSize}}>⚠️</CustomText>
        )}
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true)
    await getTX(1);
    setRefreshing(false)
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.backgroundColor, alignItems: 'center', justifyContent: 'center'}]}>
          <ActivityIndicator color={theme.textColor} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View
      style={[styles.container, {backgroundColor: theme.backgroundColor, paddingTop: insets.top}]}>
      <TxDetailModal
        visible={showTxDetail}
        onClose={() => setShowTxDetail(false)}
        txObj={txObjForDetail}
      />
      <ENIcon.Button
        style={{paddingHorizontal: 20}}
        name="chevron-left"
        onPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />
      <View style={styles.header}>
        <CustomText style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'RECENT_TRANSACTION')}
        </CustomText>
      </View>
      {groupByDate(txList, 'date').length === 0 && (
        <View style={styles.noTXContainer}>
          <Image
            style={{width: 224, height: 222, marginBottom: 23, marginTop: 70}}
            source={require('../../assets/no_tx.png')}
          />
          <CustomText style={[styles.noTXText, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_TRANSACTION')}
          </CustomText>
          <CustomText style={{color: theme.mutedTextColor, fontSize: 15, marginBottom: 32}}>
            {getLanguageString(language, 'NO_TRANSACTION_SUB_TEXT')}
          </CustomText>
        </View>
      )}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        onScroll={({nativeEvent}) => {
          if (!haveMore || gettingMore) return;
          if (isCloseToBottom(nativeEvent)) {
            setPage(page + 1)
          }
        }}
        style={{flex: 1}}
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
        {groupByDate(txList, 'date').map((txsByDate) => {
          const dateLocale = getDateFNSLocale(language);
          return (
            <React.Fragment key={`transaction-by-${txsByDate.date.getTime()}`}>
              <CustomText
                style={{
                  marginHorizontal: 20,
                  color: theme.textColor,
                }}>
                {format(new Date(txsByDate.date), 'E, dd/MM/yyyy', {locale: dateLocale})}
              </CustomText>
              {txsByDate.items.map((item: any, index: number) => {
                return (
                  <View
                    key={`tx-item-${index}`}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginHorizontal: 20,
                      marginVertical: 8,
                      borderRadius: 8,
                      backgroundColor: theme.backgroundFocusColor,
                    }}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        setTxObjForDetail(item);
                        setShowTxDetail(true);
                      }}>
                      {renderIcon(item.status, item.type)}
                      <View
                        style={{
                          flexDirection: 'column',
                          flex: 4,
                          paddingHorizontal: 4,
                        }}>
                        <CustomText style={{color: '#FFFFFF', fontSize: theme.defaultFontSize + 1, fontWeight: '500'}}>
                          {
                            item.toName === 'KAIDEX: Router' ? item.toName :
                              item.type === 'IN'
                              ? getLanguageString(language, 'TX_TYPE_RECEIVED')
                              : getLanguageString(language, 'TX_TYPE_SEND')
                          }
                        </CustomText>
                        <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>
                          {truncate(item.label, 8, 10)}
                        </CustomText>
                      </View>
                      <View
                        style={{
                          flex: 3,
                          alignItems: 'flex-end',
                        }}>
                        <CustomText
                          style={[
                            styles.kaiAmount,
                            {color: theme.textColor, fontSize: theme.defaultFontSize + 1}
                          ]}>
                          {/* {item.type === 'IN' ? '+' : '-'} */}
                          {/* {parseKaiBalance(item.amount, true)}{' '} */}
                          {formatNumberString(parseDecimals(item.amount, item.decimals), 4)}{' '}
                          <CustomText style={{color: theme.mutedTextColor}}>
                            {item.symbol || 'KAI'}
                          </CustomText>
                        </CustomText>
                        <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>
                          {format(new Date(item.date), 'hh:mm aa')}
                        </CustomText>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </React.Fragment>
          );
        })}
        {gettingMore && (
          <View style={{paddingVertical: 12}}>
            <ActivityIndicator color={theme.textColor} size="small" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TransactionScreen;
