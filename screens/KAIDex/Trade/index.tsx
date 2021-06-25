import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import SelectingPair from './SelectingPair';
import MarketScreen from './MarketScreen';
import { ThemeContext } from '../../../ThemeContext';
import { useQuery } from '@apollo/client';
import { GET_PAIRS } from '../../../services/dex/queries';

export default ({routeParams}: {
	routeParams: any
}) => {
	const theme = useContext(ThemeContext)

	const { loading, error, data: _pairData, refetch } = useQuery(GET_PAIRS, {fetchPolicy: 'no-cache'});

	const [refreshing, setRefreshing] = useState(false);
	const [pairData, setPairData] = useState({pairs: [] as any[]})
	const [selectingPair, setSelectingPair] = useState(false)

	const [tokenFrom, setTokenFrom] = useState<PairToken>()
  const [tokenFromLiquidity, setTokenFromLiquidity] = useState('');
  const [tokenTo, setTokenTo] = useState<PairToken>()
  const [tokenToLiquidity, setTokenToLiquidity] = useState('');
  const [pairAddress, setPairAddress] = useState('');
	const [volumeUSD, setVolumeUSD] = useState('')

	const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

	useEffect(() => {
    if (!routeParams || loading || error) return;
    if (!pairData.pairs) return;
    const _pairAddress = (routeParams as any).pairAddress
    if (_pairAddress) {
      refetch()
    }
  }, [routeParams])

	if (selectingPair) {
    return (
      <SelectingPair
        pairData={pairData}
        loading={loading}
        goBack={() => setSelectingPair(false)}
        onSelect={(from: PairToken, to: PairToken, liquidityFrom, liquidityTo, pairAddress, volumeUSD) => {
          setTokenFrom(from);
          setTokenTo(to);
          setSelectingPair(false);
          setTokenFromLiquidity(liquidityFrom);
          setTokenToLiquidity(liquidityTo)
          setPairAddress(pairAddress)
          setVolumeUSD(volumeUSD)
        }}
      />
    )
  }

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={{
				flex: 1,
			}}
			contentContainerStyle={{
				paddingBottom: 28
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
			<View onStartShouldSetResponder={() => true}>
			<MarketScreen 
				// triggerSelectPair={() => setSelectingPair(true)} 
				triggerSelectPair={() => {}} 
				tokenFrom={tokenFrom}
				tokenTo={tokenTo}
				tokenFromLiquidity={tokenFromLiquidity}
				tokenToLiquidity={tokenToLiquidity}
				pairAddress={pairAddress}
				totalVolume={volumeUSD}
			/>
			</View>
		</ScrollView>
	)
}