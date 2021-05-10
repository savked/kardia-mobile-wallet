/* eslint-disable react-native/no-inline-styles */
import {format} from 'date-fns';
import React, {useContext, useEffect, useState} from 'react';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {selectedWalletAtom} from '../../atoms/wallets';
import {getTx} from '../../services/krc20';
import {ThemeContext} from '../../ThemeContext';
import {getDateFNSLocale, getLanguageString} from '../../utils/lang';
import {getSelectedWallet, getWallets} from '../../utils/local';
import {parseDecimals} from '../../utils/number';
import {truncate} from '../../utils/string';
import numeral from 'numeral';
import {styles} from './style';
import {groupByDate} from '../../utils/date';
import Button from '../../components/Button';
import NewKRC20TxModal from '../common/NewKRC20TxModal';
import KRC20TxDetailModal from '../common/KRC20TxDetailModal';
import CustomText from '../../components/Text';

const TokenTxList = ({
  tokenAddress,
  tokenAvatar,
  tokenSymbol,
  tokenDecimals,
}: {
  tokenAddress: string;
  tokenAvatar: string;
  tokenSymbol: string;
  tokenDecimals: number;
}) => {
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const [txList, setTxList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTxDetail, setShowTxDetail] = useState(false);
  const [txObjForDetail, setTxObjForDetail] = useState();
  const [page, setPage] = useState(1);

  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const fetchTxList = async (page: number) => {
    const _wallets = await getWallets();
    const _selectedWallet = await getSelectedWallet();
    return await getTx(
      tokenAddress,
      _wallets[_selectedWallet].address,
      page
    );
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const _txList = await fetchTxList(1);
      setTxList(_txList);
      setLoading(false);

      // const intervalId = setInterval(() => {
      //   fetchTxList();
      // }, 2000);
      // return () => clearInterval(intervalId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet, tokenAddress]);

  useEffect(() => {
    (async () => {
      const _txList =  await fetchTxList(2)
      // console.log(_txList)
    })()
  }, [page])

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
        {status ? (
          <AntIcon
            name="checkcircle"
            size={14}
            color={'green'}
            style={{position: 'absolute', right: 0, bottom: 0}}
          />
        ) : (
          <AntIcon
            name="closecircle"
            size={14}
            color={'red'}
            style={{position: 'absolute', right: 0, bottom: 0}}
          />
        )}
      </View>
    );
  };

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 20;
    console.log('layoutMeasurement.height + contentOffset.y', layoutMeasurement.height + contentOffset.y)
    console.log('contentSize.height - paddingToBottom', contentSize.height - paddingToBottom)
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  if (loading) {
    return <ActivityIndicator size={40} color={theme.textColor} />;
  }

  return (
    <>
      <NewKRC20TxModal
        visible={showNewTxModal}
        tokenAvatar={tokenAvatar}
        onClose={() => {
          setShowNewTxModal(false);
        }}
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
        tokenDecimals={tokenDecimals}
      />
      <KRC20TxDetailModal
        visible={showTxDetail}
        onClose={() => setShowTxDetail(false)}
        txObj={txObjForDetail}
      />
      {groupByDate(txList, 'date').length === 0 && (
        <View style={styles.noTXContainer}>
          <Image
            style={{width: 66, height: 49, marginBottom: 17.5}}
            source={require('../../assets/no_tx_butterfly.png')}
          />
          <Image
            style={{width: 128, height: 105}}
            source={require('../../assets/no_tx_box.png')}
          />
          <CustomText style={[styles.noTXText, {color: theme.textColor, fontSize: 24, fontWeight: 'bold'}]}>
            {getLanguageString(language, 'NO_TRANSACTION')}
          </CustomText>
          <CustomText style={{color: theme.textColor}}>
            {getLanguageString(language, 'NO_KRC20_TRANSACTION_SUB_TEXT')}
          </CustomText>
          <View style={{marginHorizontal: 83, marginTop: 32}}>
            <Button
              type="primary"
              onPress={() => setShowNewTxModal(true)}
              title={getLanguageString(language, 'SEND_NOW')}
              block={true}
              icon={
                <AntIcon
                  name="plus"
                  size={20}
                  color={'#000000'}
                  style={{marginRight: 8}}
                />
              }
              textStyle={{
                fontSize: theme.defaultFontSize + 2,
                fontWeight: '500',
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
              }}
            />
          </View>
        </View>
      )}
      <ScrollView
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            setPage(page + 1)
          }
        }}
        scrollEventThrottle={400}
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
                {format(txsByDate.date, 'E, dd/MM/yyyy', {locale: dateLocale})}
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
                          paddingHorizontal: 14,
                        }}>
                        <CustomText style={{color: '#FFFFFF'}}>
                          {item.type === 'IN'
                            ? getLanguageString(language, 'TX_TYPE_RECEIVED')
                            : getLanguageString(language, 'TX_TYPE_SEND')}
                        </CustomText>
                        <CustomText style={{color: '#DBDBDB', fontSize: 12}}>
                          {truncate(item.transactionHash, 8, 10)}
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
                            item.type === 'IN'
                              ? {color: '#53B680'}
                              : {color: 'red'},
                          ]}>
                          {item.type === 'IN' ? '+' : '-'}
                          {numeral(
                            parseDecimals(Number(item.value), tokenDecimals),
                          ).format('0,0.00')}{' '}
                          {tokenSymbol}
                        </CustomText>
                        <CustomText style={{color: '#DBDBDB', fontSize: 12}}>
                          {format(item.date, 'hh:mm aa')}
                        </CustomText>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </React.Fragment>
          );
        })}
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
    </>
  );
};

export default TokenTxList;
