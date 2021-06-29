import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@apollo/client';
import {ScrollView} from 'react-native-gesture-handler';
import ComingSoon from '../../common/ComingSoon';
import {format} from 'date-fns';
import { MY_ORDER_HISTORY } from '../../../services/dex/queries';
import { useRecoilValue } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import { ThemeContext } from '../../../ThemeContext';
import { getDateFNSLocale, getLanguageString } from '../../../utils/lang';
import CustomText from '../../../components/Text';
import { languageAtom } from '../../../atoms/language';
import { formatNumberString, parseDecimals } from '../../../utils/number';
import { groupByDate } from '../../../utils/date';
import { truncate } from '../../../utils/string';

const SIZE = 10
const ITEM_HEIGHT = 93

export default () => {
	const theme = useContext(ThemeContext)
	const wallets = useRecoilValue(walletsAtom)
	const selectedWallet = useRecoilValue(selectedWalletAtom)
	const language = useRecoilValue(languageAtom)

	const [orderList, setOrderList] = useState<any[]>([])
	const [page, setPage] = useState(1)
	const [gettingMore, setGettingMore] = useState(false);
  const [haveMore, setHaveMore] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const [showTxDetail, setShowTxDetail] = useState(false);
  const [txObjForDetail, setTxObjForDetail] = useState();

	const { loading, error, data, refetch } = useQuery(
		MY_ORDER_HISTORY, 
		{
			fetchPolicy: 'no-cache',
			variables: {
				actorAddress: wallets[selectedWallet].address.toLowerCase(),
				skip: (page - 1) * SIZE,
				first: SIZE
			}
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

	const isBuy = (amount0In: string) => {
		return amount0In === "0"
	}

	const onRefresh = async () => {
		setRefreshing(true)
		console.log('here refresh')
    setPage(1)
  }

	useEffect(() => {
		if (error) {
			console.log(error)
		} else if (data) {
			const parsedData = data.swaps.map((item: any) => {
				return {
					...item,
					date: new Date(item.timestamp * 1000)
				}
			})
			setGettingMore(false)
			if (parsedData.length === 0) {
				setHaveMore(false);
				return;
			}
			if (page === 1) {
				setRefreshing(false)
				setOrderList(parsedData)
			} else {
				setOrderList([...orderList , ...parsedData])
			}
		}
	}, [error, data])

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
        {status === 0 && (
          // <Image source={require('../../assets/icon/warning.png')} style={{width: 14, height: 14, position: 'absolute', right: 3, top: -2}} />
          <CustomText style={{position: 'absolute', right: 0, top: -4, fontSize: theme.defaultFontSize}}>⚠️</CustomText>
        )}
      </View>
    );
  };

  return (
		<View style={{flex: 1}}>
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
                        setTxObjForDetail(item);
                        setShowTxDetail(true);
                      }}>
                      {renderIcon(item.status, isBuy(item.amount0In) ? 'IN' : 'OUT')}
                      <View
                        style={{
                          flexDirection: 'column',
                          flex: 4,
                          paddingHorizontal: 4,
                        }}>
                        <CustomText style={{color: '#FFFFFF', fontSize: theme.defaultFontSize + 1, fontWeight: '500'}}>
                          {
                            isBuy(item.amount0In) ? getLanguageString(language, 'ORDER_TYPE_BUY')
                              : getLanguageString(language, 'ORDER_TYPE_SELL')
                          }
                        </CustomText>
                        <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>
                          {truncate(item.transaction.id, 8, 10)}
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
														isBuy(item.amount0In) ? item.amount0Out : item.amount0In, 
														4
													)}{' '}
                          <CustomText style={{color: theme.mutedTextColor}}>
                            {item.pair.token0.symbol}
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
		</View>
	)
};