import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import CustomText from '../../../components/Text';
import { getPairs } from '../../../services/dex';
import { apolloSettlementClient } from '../../../services/dex/apolloClient';
import { MY_PENDING_LIMIT_ORDER } from '../../../services/dex/queries';
import { ThemeContext } from '../../../ThemeContext';
import { groupByDate } from '../../../utils/date';
import { parseSymbolWKAI } from '../../../utils/dex';
import { getDateFNSLocale, getLanguageString } from '../../../utils/lang';
import { formatNumberString, parseDecimals } from '../../../utils/number';
import LimitOrderDetailModal from '../../common/LimitOrderDetailModal';

const SIZE = 10
const ITEM_HEIGHT = 95

export default () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const wallets = useRecoilValue(walletsAtom)
	const selectedWallet = useRecoilValue(selectedWalletAtom)

  const [orderList, setOrderList] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [gettingMore, setGettingMore] = useState(false);
  const [haveMore, setHaveMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [orderObjForDetail, setOrderObjForDetail] = useState<any>();

  const fetchPairData = async () => {
    try {
      const rs = await getPairs()
      if (rs) {
        return rs.pairs
      }
      return []
    } catch (error) {
      console.log(error)
      return []
    }
  }

  const { loading, error, data, refetch } = useQuery(
		MY_PENDING_LIMIT_ORDER, 
		{
			fetchPolicy: 'no-cache',
			variables: {
				traderAddr: wallets[selectedWallet].address.toLowerCase(),
				skip: (page - 1) * SIZE,
				first: SIZE
			},
      client: apolloSettlementClient
		}
	);

  useEffect(() => {
    (async () => {
      setGettingMore(true);
    })()
  }, [page]);

	useEffect(() => {
		if (!loading) setGettingMore(false)
	}, [loading])

	const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 550;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

	const onRefresh = async () => {
		setRefreshing(true)
    setPage(1)
  }

  useEffect(() => {
    (async () => {
      if (error) {
        console.log(error)
      } else if (data) {
        const pairList = await fetchPairData();
        const parsedData = data.orders.map((order: any) => {
          let _orderPrice = order.tradeType === 0 ? order.orderPrice0 : order.orderPrice1
          let _amount = order.tradeType === 0 ? order.orderOutputAmount : order.orderInputAmount
          let _total = order.tradeType === 0 ? order.orderInputAmount : order.orderOutputAmount

          const pairItem: any = pairList.find((_pairItem: any) => _pairItem.id === order.pair)

          return {
            ...order,
            pair: {
              id: pairItem.id,
              pairIdentity: pairItem.pairIdentity,
              token0: pairItem.pairIdentity.invert ? pairItem.token1 : pairItem.token0,
              token1: pairItem.pairIdentity.invert ? pairItem.token0 : pairItem.token1
            },
            price: _orderPrice,
            amount: _amount,
            total: _total,
            traderAddr: order.trader ? order.trader.id : '',
            date: new Date(Number(order.createdAt) * 1000)
          }
        })
  
        setGettingMore(false)
        if (parsedData.length === 0) {
          setHaveMore(false);
          setRefreshing(false)
          if (page === 1) {
            setOrderList([])
          }
          return;
        }
        if (page === 1) {
          setRefreshing(false)
          setOrderList(parsedData)
        } else {
          setOrderList([...orderList , ...parsedData])
        }
      }
    })()
	}, [error, data])

  const renderIcon = (type: 'IN' | 'OUT') => {
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
              source={require('../../../assets/icon/receive.png')}
              style={{
								width: 30,
								height: 30,
							}}
            />
          ) : (
            <Image
              source={require('../../../assets/icon/send.png')}
              style={{
								width: 30,
								height: 30,
							}}
            />
          )}
        </View>
      </View>
    );
  };

  const renderBadge = (status: number) => {
    switch (status) {
      case 1:
        // Open order
        return (
          <View style={{paddingHorizontal: 4, paddingVertical: 2, backgroundColor: 'rgba(174, 126, 71, 1)', borderRadius: 4}}>
            <CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize}}>Pending</CustomText>
          </View>
        )
      case 2:
        // Cancelled order
        return (
          <View style={{paddingHorizontal: 4, paddingVertical: 2, backgroundColor: 'rgba(96, 99, 108, 1)', borderRadius: 4}}>
            <CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize}}>Cancelled</CustomText>
          </View>
        )
      default:
        return (
          <View style={{paddingHorizontal: 4, paddingVertical: 2, backgroundColor: 'rgba(85, 197, 83, 1)', borderRadius: 4}}>
            <CustomText style={{fontSize: theme.defaultFontSize}}>Completed</CustomText>
          </View>
        )
    }
  }

  return (
    <>
      <LimitOrderDetailModal
        visible={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        orderObj={orderObjForDetail}
        refreshLimitOrders={() => {
          if (page !== 1) {
            onRefresh()
          } else {
            refetch()
          }
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={8}
        onScroll={({nativeEvent}) => {
          if (!haveMore || gettingMore) return;
          if (isCloseToBottom(nativeEvent)) {
            setGettingMore(true)
            setPage(page + 1)
          }
        }}
        style={{
          height: ITEM_HEIGHT * SIZE - 150,
          // flex: 1
        }}
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
        {groupByDate(orderList, 'date').map((ordersByDate) => {
          const dateLocale = getDateFNSLocale(language);
          return (
            <React.Fragment key={`transaction-by-${ordersByDate.date.getTime()}`}>
              <CustomText
                style={{
                  // marginHorizontal: 20,
                  color: theme.textColor,
                }}>
                {format(new Date(ordersByDate.date), 'E, dd/MM/yyyy', {locale: dateLocale})}
              </CustomText>
              {ordersByDate.items.map((item: any, index: number) => {
                return (
                  <View
                    key={`tx-item-${index}`}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      // marginHorizontal: 20,
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
                        setOrderObjForDetail(item);
                        setShowOrderDetail(true);
                      }}>
                      {renderIcon(item.tradeType === 0 ? 'IN' : 'OUT')}
                      <View
                        style={{
                          flexDirection: 'column',
                          flex: 4,
                          paddingHorizontal: 4,
                        }}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}>
                          <CustomText style={{color: '#FFFFFF', fontSize: theme.defaultFontSize + 1, fontWeight: '500', marginRight: 12}}>
                            {parseSymbolWKAI(item.pair.token0.symbol)} / {parseSymbolWKAI(item.pair.token1.symbol)}
                          </CustomText>
                          {renderBadge(item.status)}
                        </View>
                        <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>
                          {/* {truncate(item.transaction.id, 8, 10)} */}
                          {getLanguageString(language, item.tradeType === 0 ? 'BUY_AT' : 'SELL_AT')}{' '}
                          <CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize}}>
                            {formatNumberString(item.price, 6)}
                          </CustomText>
                        </CustomText>
                      </View>
                      <View
                        style={{
                          flex: 3,
                          alignItems: 'flex-end',
                        }}>
                        <CustomText
                          style={[
                            {color: theme.textColor, fontSize: theme.defaultFontSize + 1}
                          ]}>
                          {formatNumberString(
                            // isLimitBuy(item) ?
                            //   parseDecimals(item.total, item.pair.token1.decimals) :
                            //   parseDecimals(item.amount, item.pair.token0.decimals)
                            parseDecimals(item.amount, item.pair.token0.decimals)
                            , 
                            4
                          )}{' '}
                          <CustomText style={{color: theme.mutedTextColor}}>
                            {parseSymbolWKAI(item.pair.token0.symbol)}
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
          <View>
            <ActivityIndicator color={theme.textColor} size="small" />
          </View>
        )}
      </ScrollView>
    </>
  )
}