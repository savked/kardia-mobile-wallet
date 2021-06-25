import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useQuery } from '@apollo/client';
import ComingSoon from '../../common/ComingSoon';
import { MY_ORDER_HISTORY } from '../../../services/dex/queries';
import { useRecoilValue } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';

export default () => {
	const wallets = useRecoilValue(walletsAtom)
	const selectedWallet = useRecoilValue(selectedWalletAtom)

	const [orderList, setOrderList] = useState([])

	const { loading, error, data } = useQuery(
		MY_ORDER_HISTORY, 
		{
			// fetchPolicy: 'no-cache',
			variables: {
				actorAddress: wallets[selectedWallet].address.toLowerCase()
			}
		}
	);

	useEffect(() => {
		console.log('loading', loading)
		if (error) {
			console.log(error)
		} else if (data) {
			console.log(data.swaps[0])
		}
	}, [error, data])

  return (
		<ComingSoon />
	)
};