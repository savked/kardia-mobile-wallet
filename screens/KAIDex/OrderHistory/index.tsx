import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useQuery } from '@apollo/client';
import {ScrollView} from 'react-native-gesture-handler';
import ComingSoon from '../../common/ComingSoon';
import { MY_ORDER_HISTORY } from '../../../services/dex/queries';
import { useRecoilValue } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import { ThemeContext } from '../../../ThemeContext';

const SIZE = 20

export default () => {
	const theme = useContext(ThemeContext)
	const wallets = useRecoilValue(walletsAtom)
	const selectedWallet = useRecoilValue(selectedWalletAtom)

	const [orderList, setOrderList] = useState<any[]>([])
	const [page, setPage] = useState(1)
	const [gettingMore, setGettingMore] = useState(false);
  const [haveMore, setHaveMore] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const { loading, error, data, refetch } = useQuery(
		MY_ORDER_HISTORY, 
		{
			// fetchPolicy: 'no-cache',
			variables: {
				actorAddress: wallets[selectedWallet].address.toLowerCase(),
				skip: (page - 1) * SIZE,
				first: SIZE
			}
		}
	);

	const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 550;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

	const onRefresh = async () => {
    setPage(1)
  }

	useEffect(() => {
		console.log('loading', loading)
		if (error) {
			console.log(error)
		} else if (data) {
			if (page === 1) {
				setOrderList(data.swaps)
			} else {
				setOrderList([...orderList , ...data.swaps])
			}
		}
	}, [error, data])

  return (
		<View>
			<ComingSoon />
			{/* <ScrollView 
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

			</ScrollView> */}
		</View>
	)
};