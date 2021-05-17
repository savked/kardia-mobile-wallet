/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {TouchableOpacity, View, Image, ActivityIndicator, Platform, RefreshControl} from 'react-native';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {truncate} from '../../utils/string';
import {styles} from './style';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {getTxByAddress} from '../../services/transaction';
import {parseKaiBalance} from '../../utils/number';
import {format} from 'date-fns';
import {getDateFNSLocale, getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
import NewTxModal from '../common/NewTxModal';
import {ThemeContext} from '../../ThemeContext';
import {getSelectedWallet, getWallets} from '../../utils/local';
import Button from '../../components/Button';
import {groupByDate} from '../../utils/date';
import TxDetailModal from '../common/TxDetailModal';
import {ScrollView} from 'react-native-gesture-handler';
import {showTabBarAtom} from '../../atoms/showTabBar';
import CustomText from '../../components/Text';
import { statusBarColorAtom } from '../../atoms/statusBar';

const TransactionScreen = () => {
  const theme = useContext(ThemeContext);
  // const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gettingMore, setGettingMore] = useState(false);

  const [wallets] = useRecoilState(walletsAtom);
  const [selectedWallet] = useRecoilState(selectedWalletAtom);
  const [txList, setTxList] = useState([] as any[]);
  const [showNewTxModal, setShowNewTxModal] = useState(false);
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

  const getTX = async () => {
    const SIZE = 30;
    if (page * SIZE <= txList.length || gettingMore) {
      setLoading(false);
      setGettingMore(false);
      return;
    }
    const localWallets = await getWallets();
    const localSelectedWallet = await getSelectedWallet();
    if (
      !localWallets[localSelectedWallet] ||
      !localWallets[localSelectedWallet].address
    ) {
      return;
    }
    try {
      const newTxList = await getTxByAddress(
        localWallets[localSelectedWallet].address,
        page,
        SIZE,
      );
      setTxList([...txList, ...newTxList.map(parseTXForList)]);
      setLoading(false)
      setGettingMore(false);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      setStatusBarColor(theme.backgroundColor);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNewTxModal]),
  );

  useEffect(() => {
    (async () => {
      if (gettingMore) {
        return;
      }
      setGettingMore(true)
      await getTX();
    })()
  }, [page, gettingMore])

  const parseTXForList = (tx: Transaction) => {
    return {
      label: tx.hash,
      value: tx.hash,
      amount: tx.amount,
      date: tx.date,
      from: tx.from,
      to: tx.to,
      hash: tx.hash,
      txFee: tx.fee,
      blockHash: tx.blockHash || '',
      blockNumber: tx.blockNumber || '',
      status: tx.status,
      type:
        wallets[selectedWallet] && tx.from === wallets[selectedWallet].address
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
    await getTX();
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
      <NewTxModal
        visible={showNewTxModal}
        onClose={() => setShowNewTxModal(false)}
      />
      <TxDetailModal
        visible={showTxDetail}
        onClose={() => setShowTxDetail(false)}
        txObj={txObjForDetail}
      />
      <View style={styles.header}>
        <CustomText style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'RECENT_TRANSACTION')}
        </CustomText>
        {/* <IconButton
          name="bell-o"
          color={theme.textColor}
          size={20}
          onPress={() => navigation.navigate('Notification')}
        /> */}
      </View>
      {groupByDate(txList, 'date').length === 0 && (
        <View style={styles.noTXContainer}>
          <Image
            style={{width: 87, height: 66, marginBottom: 23, marginTop: 70}}
            source={require('../../assets/no_tx_butterfly.png')}
          />
          <Image
            style={{width: 170, height: 140}}
            source={require('../../assets/no_tx_box.png')}
          />
          <CustomText style={[styles.noTXText, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_TRANSACTION')}
          </CustomText>
          <CustomText style={{color: theme.mutedTextColor, fontSize: 15, marginBottom: 32}}>
            {getLanguageString(language, 'NO_TRANSACTION_SUB_TEXT')}
          </CustomText>
          <Button
            type="primary"
            onPress={() => setShowNewTxModal(true)}
            title={getLanguageString(language, 'SEND_NOW')}
            textStyle={{
              fontWeight: '500',
              fontSize: theme.defaultFontSize + 4,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
            style={{width: 248}}
            icon={
              <AntIcon
                name="plus"
                size={20}
                color={'#000000'}
                style={{marginRight: 8}}
              />
            }
          />
        </View>
      )}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent) && !gettingMore) {
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
                          {item.type === 'IN'
                            ? getLanguageString(language, 'TX_TYPE_RECEIVED')
                            : getLanguageString(language, 'TX_TYPE_SEND')}
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
                          {parseKaiBalance(item.amount, true)}{' '}
                          <CustomText style={{color: theme.mutedTextColor}}>
                            KAI
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
      {txList.length > 0 && (
        <Button
          type="primary"
          icon={<AntIcon name="plus" size={24} />}
          size="small"
          onPress={() => setShowNewTxModal(true)}
          style={styles.floatingButton}
        />
      )}
    </View>
  );
};

export default TransactionScreen;
