import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Platform, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { filterByOwnerSelector, krc20PricesAtom } from '../../atoms/krc20';
import { languageAtom } from '../../atoms/language';
import { tokenInfoAtom } from '../../atoms/token';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import CustomText from '../../components/Text';
import { getBalance } from '../../services/krc20';
import { weiToKAI } from '../../services/transaction/amount';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString, parseCardAvatar } from '../../utils/lang';
import { formatNumberString, parseDecimals } from '../../utils/number';
import ControlSection from './ControlSection';
import { styles } from './style';

const {width: viewportWidth} = Dimensions.get('window');

export default ({wallet, noAction = false, cardId}: {
	wallet: any
	noAction?: boolean;
	cardId?: number;
}) => {
	const theme = useContext(ThemeContext);
	const tokenInfo = useRecoilValue(tokenInfoAtom);
	const language = useRecoilValue(languageAtom)
	const wallets = useRecoilValue(walletsAtom);
	const selectedWallet = useRecoilValue(selectedWalletAtom)
	const krc20Prices = useRecoilValue(krc20PricesAtom);;
	const tokenList = useRecoilValue(filterByOwnerSelector(wallets[selectedWallet].address))
	const [balance, setBalance] = useState<string[]>([]);

	const [KRC20Balance, setKRC20Balance] = useState(0)

  useEffect(() => {
		(async () => {
			const promiseArr = tokenList.map((i) => {
				return getBalance(i.address, wallets[selectedWallet].address);
			});
			const balanceArr = await Promise.all(promiseArr);

			const _krc20Balance = tokenList.reduce((accumulator, currentValue, index) => {
				const price = krc20Prices[currentValue.address] ? Number(krc20Prices[currentValue.address].price) : 0
				const decimalValue = parseDecimals(balanceArr[index], currentValue.decimals)
				return accumulator + Number(decimalValue) * price
			}, 0)
	
			setKRC20Balance(_krc20Balance);
		})()
  }, [tokenList, selectedWallet]);

  return (
		<View style={styles.kaiCardContainer}>
			<View style={styles.kaiCard}>
				<Image
					style={[styles.cardBackground, {width: viewportWidth - 40}]}
					source={parseCardAvatar(cardId || wallet.cardAvatarID)}
					// source={require('../../assets/test.jpg')}
				/>
				<View
					style={{
						alignItems: 'center',
					}}>
					<CustomText allowFontScaling={false} style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: theme.defaultFontSize}}>
						{getLanguageString(language, 'TOTAL_BALANCE').toUpperCase()}
					</CustomText>
					<CustomText allowFontScaling={false} style={Platform.OS === 'android' ? {fontSize: 24, color: theme.textColor, fontFamily: 'WorkSans-SemiBold'} : {fontSize: 24, color: theme.textColor, fontWeight: '500'}}>
						{tokenInfo.price ? '$' + formatNumberString(
							(
								tokenInfo.price * (
									Number(weiToKAI(wallet.balance)) 
									+ wallet.staked 
									+ wallet.undelegating
								) + KRC20Balance
							).toString(),
							2,
							0
						) : '--'}
					</CustomText>
				</View>

				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1}}>
					<ControlSection noAction={noAction} />
				</View>

				<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
					<View>
						<CustomText style={Platform.OS === 'android' ? {fontSize: 15, color: 'rgba(252, 252, 252, 0.87)', fontFamily: 'WorkSans-SemiBold'} : {fontSize: 15, color: 'rgba(252, 252, 252, 0.87)', fontWeight: '500'}}>
							{wallet.name ? wallet.name.toUpperCase() : getLanguageString(language,'NEW_WALLET').toUpperCase()}
						</CustomText>
					</View>
				</View>
			</View>
		</View>
	);
}
