import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import CustomModal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import CustomTextInput from '../../../components/TextInput';
import { getTokenBalance } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { getPairPriceInBN, parseSymbolWKAI } from '../../../utils/dex';
import { getLanguageString } from '../../../utils/lang';
import { formatNumberString, getDecimalCount, getDigit, isNumber, parseDecimals } from '../../../utils/number';

export default ({visible, onClose, pair}: {
	visible: boolean;
	onClose: () => void
	pair?: Pair
}) => {

	const theme = useContext(ThemeContext)
	const language = useRecoilValue(languageAtom)

	const [token0, setToken0] = useState('')
	const [balance0, setBalance0] = useState('0')
	const [token1, setToken1] = useState('')
	const [balance1, setBalance1] = useState('0')
	const [errorToken0, setErrorToken0] = useState('')
	const [editting, setEditting] = useState('')

	const wallets = useRecoilValue(walletsAtom)
	const selectedWallet = useRecoilValue(selectedWalletAtom)


	if (!pair) {
		return null
	}

	useEffect(() => {
		(async () => {
			if (!pair) return;

			const _bl0 = await getTokenBalance(pair.t1.hash, wallets[selectedWallet].address)
			setBalance0(_bl0)

			const _bl1 = await getTokenBalance(pair.t2.hash, wallets[selectedWallet].address)
			setBalance1(_bl1)
		})()
	}, [])

	useEffect(() => {
		if (editting === '0') {
			const digitOnly = getDigit(token0);
			const priceBN = getPrice('BN')
			const token0BN = new BigNumber(digitOnly)
			const token1BN = token0BN.multipliedBy(priceBN).toFixed()
			setToken1(formatNumberString(token1BN))
		}
	}, [token0])

	useEffect(() => {
		if (editting === '1') {
			const digitOnly = getDigit(token1);
			const priceBN = getPrice('BN')
			const token1BN = new BigNumber(digitOnly)
			const token0BN = token1BN.multipliedBy(priceBN).toFixed()
			setToken0(formatNumberString(token0BN))
		}
	}, [token1])

	const getContentStyle = () => {
		return {
			backgroundColor: theme.backgroundFocusColor,
			height: 470,
			padding: 20,
			paddingTop: 32,
			justifyContent: 'flex-start'
		}
	}

	const getPrice = (returnType = 'string') => {
		const priceBN = getPairPriceInBN(pair.token1_liquidity, pair.token2_liquidity)
		if (returnType === 'number') return priceBN.toNumber()
		if (returnType === 'BN') return priceBN
		return formatNumberString(priceBN.toFixed(), 6)
	}

  return (
		<CustomModal
			visible={visible}
			onClose={onClose}
			showCloseButton={false}
			contentStyle={getContentStyle()}
		>
			<View style={{width: '100%', marginBottom: 12}}>
				<View style={{width: '100%', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between'}}>
					<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 2}}>First token</CustomText>
					<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 2}}>
						Balance: 
						<CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balance0, pair.t1.decimals), 6)}</CustomText>
					</CustomText>
				</View>
				<CustomTextInput
					onChangeText={(newValue) => {
						const digitOnly = getDigit(newValue, pair.t1.decimals === 0 ? false : true);
						if (digitOnly === '') {
							setToken0('0')
						}
						if (getDecimalCount(newValue) > pair.t1.decimals) {
							return;
						}
					
						if (isNumber(digitOnly)) {
							let formatedValue = formatNumberString(digitOnly);
							
							if (pair.t1.decimals == 0) {
								setToken0(formatedValue);
								return
							}

							const [numParts, decimalParts] = digitOnly.split('.')

							if (!decimalParts && decimalParts !== "") {
								setToken0(formatedValue);
								return
							}

							formatedValue = formatNumberString(numParts) + '.' + decimalParts

							// if (newValue[newValue.length - 1] === '.') formatedValue += '.'
							// else if (newValue[newValue.length - 2] === '.' && newValue[newValue.length - 1] === '0') formatedValue += '.0'
							setToken0(formatedValue)
						}
					}}
					onFocus={() => setEditting('0')}
					onBlur={() => setEditting('')}
					message={errorToken0}
					value={token0}
					inputStyle={{
						backgroundColor: 'rgba(96, 99, 108, 1)',
						color: theme.textColor,
						paddingRight: 60
					}}
					// headline={getLanguageString(language, 'CREATE_TX_ADDRESS')}
					icons={() => {
						return (
							<View
								style={{position: 'absolute', right: 10, flexDirection: 'row', alignItems: 'center'}}
							>
								<Image
									source={{uri: pair.t1.logo}}
									style={{
										width: 18,
										height: 18,
										marginRight: 4
									}}
								/>
								<CustomText
									style={{
										color: theme.textColor,
										fontWeight: '500',
										fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
									}}
								>
									{parseSymbolWKAI(pair.t1.symbol)}
								</CustomText>
							</View>
						)
					}}
				/>
			</View>
			<View style={{width: '100%'}}>
				<View style={{width: '100%', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between'}}>
					<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 2}}>Second token</CustomText>
					<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 2}}>
						Balance: 
						<CustomText style={{color: theme.textColor}}>{formatNumberString(parseDecimals(balance1, pair.t2.decimals), 6)}</CustomText>
					</CustomText>
				</View>
				<CustomTextInput
					onChangeText={(newValue) => {
						const digitOnly = getDigit(newValue, pair.t2.decimals === 0 ? false : true);
						if (digitOnly === '') {
							setToken1('0')
						}
						if (getDecimalCount(newValue) > pair.t2.decimals) {
							return;
						}
					
						if (isNumber(digitOnly)) {
							let formatedValue = formatNumberString(digitOnly);
							
							if (pair.t2.decimals == 0) {
								setToken1(formatedValue);
								return
							}

							const [numParts, decimalParts] = digitOnly.split('.')

							if (!decimalParts && decimalParts !== "") {
								setToken1(formatedValue);
								return
							}

							formatedValue = formatNumberString(numParts) + '.' + decimalParts

							// if (newValue[newValue.length - 1] === '.') formatedValue += '.'
							// else if (newValue[newValue.length - 2] === '.' && newValue[newValue.length - 1] === '0') formatedValue += '.0'
							setToken1(formatedValue)
						}
					}}
					onFocus={() => setEditting('1')}
					onBlur={() => setEditting('')}
					message={errorToken0}
					value={token1}
					inputStyle={{
						backgroundColor: 'rgba(96, 99, 108, 1)',
						color: theme.textColor,
						paddingRight: 60
					}}
					// headline={getLanguageString(language, 'CREATE_TX_ADDRESS')}
					icons={() => {
						return (
							<View
								style={{position: 'absolute', right: 10, flexDirection: 'row', alignItems: 'center'}}
							>
								<Image
									source={{uri: pair.t2.logo}}
									style={{
										width: 18,
										height: 18,
										marginRight: 4
									}}
								/>
								<CustomText
									style={{
										color: theme.textColor,
										fontWeight: '500',
										fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
									}}
								>
									{parseSymbolWKAI(pair.t2.symbol)}
								</CustomText>
							</View>
						)
					}}
				/>
			</View>
			<View
				style={{
					paddingVertical: 8,
					paddingHorizontal: 16,
					marginVertical: 24,
					backgroundColor: theme.backgroundStrongColor,
					borderRadius: 8
				}}
			>
				<CustomText style={{color: theme.mutedTextColor}}>
					<CustomText style={{color: theme.textColor}}>1</CustomText>{' '}
					{parseSymbolWKAI(pair.t1.symbol)}{' '}
					= <CustomText style={{color: theme.textColor}}>{getPrice()}</CustomText> {parseSymbolWKAI(pair.t2.symbol)}
				</CustomText>
			</View>
			<Button
				title={getLanguageString(language, 'CANCEL')}
				onPress={onClose}
				type="outline"
				style={{width: '100%', marginBottom: 12}}
				textStyle={{
					fontWeight: '500',
					fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
				}}
			/>
			<Button
				title={getLanguageString(language, 'SUBMIT')}
				onPress={onClose}
				textStyle={{
					fontWeight: '500',
					fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
				}}
			/>
		</CustomModal>
	)
}