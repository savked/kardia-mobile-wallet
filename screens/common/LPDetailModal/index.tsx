import BigNumber from 'bignumber.js';
import React, { useContext, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import Button from '../../../components/Button';
import Divider from '../../../components/Divider';
import CustomModal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { getPairPriceInBN, parseSymbolWKAI } from '../../../utils/dex';
import { getLanguageString } from '../../../utils/lang';
import { formatNumberString, parseDecimals } from '../../../utils/number';
import WithdrawLPModal from '../WithdrawLPModal';

export default ({visible, onClose, lpItem, triggerAddLP}: {
	visible: boolean;
	onClose: () => void;
	lpItem?: any;
	triggerAddLP: (pairAddress: string) => void
}) => {

	const theme = useContext(ThemeContext)
	const language = useRecoilValue(languageAtom)

	const [showWithdraw, setShowWithdraw] = useState(false)

	const getModalStyle = () => {
		return {
			backgroundColor: theme.backgroundFocusColor,
			justifyContent: 'flex-start',
			height: 530
		}
	}

	if (!lpItem) return null

	const getPrice = (returnType = 'string') => {
		const priceBN = getPairPriceInBN(lpItem.token1_liquidity, lpItem.token2_liquidity)
		if (returnType === 'number') return priceBN.toNumber()
		if (returnType === 'BN') return priceBN
		return formatNumberString(priceBN.toFixed(), 6)
	}

	const renderShare = () => {
		const sharePercentBN = (new BigNumber(lpItem.shareRate)).multipliedBy(new BigNumber(100))
		if (sharePercentBN.isLessThan(new BigNumber(0.001))) {
			return '< 0.001%'
		}
		return `${formatNumberString((lpItem.shareRate * 100).toString(), 2, 0)}%`
	}

	if (showWithdraw) {
		return (
			<WithdrawLPModal
				visible={showWithdraw}
				onClose={() => setShowWithdraw(false)}
				lpItem={lpItem}
			/>
		)
	}

  return (
		<CustomModal
			visible={visible}
			onClose={onClose}
			showCloseButton={false}
			contentStyle={getModalStyle()}
		>
			<View style={{flexDirection: 'row', position: 'absolute', top: -32}}>
				<View style={{width: 64, height: 64, backgroundColor: '#FFFFFF', borderRadius: 32}}>
					<Image
						source={{uri: lpItem.t1.logo}}
						style={{width: 64, height: 64}}
					/>
				</View>
				<View 
					style={{
						width: 64,
						height: 64,
						backgroundColor: '#FFFFFF',
						borderRadius: 32,
						marginLeft: -8,
						shadowColor: 'rgba(0, 0, 0, 0.3)',
						shadowOffset: {
							width: -6,
							height: 0,
						},
						shadowOpacity: 12,
						shadowRadius: 8,
						elevation: 11,
					}}
				>
					<Image
						source={{uri: lpItem.t2.logo}}
						style={{width: 64, height: 64}}
					/>
				</View>
			</View>
			<CustomText 
				style={{
					color: theme.textColor,
					fontWeight: 'bold',
					fontSize: theme.defaultFontSize + 16,
					marginTop: 16
				}}
			>
				{parseSymbolWKAI(lpItem.t1.symbol)} / {parseSymbolWKAI(lpItem.t2.symbol)}
			</CustomText>
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
					{parseSymbolWKAI(lpItem.t1.symbol)}{' '}
					= <CustomText style={{color: theme.textColor}}>{getPrice()}</CustomText> {parseSymbolWKAI(lpItem.t2.symbol)}
				</CustomText>
			</View>
			<Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%'
				}}
			>
				<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>1st Token</CustomText>
				<View style={{flexDirection: 'row', alignItems: 'center'}}>
					<Image
						source={{uri: lpItem.t1.logo}}
						style={{
							width: 20,
							height: 20,
							marginRight: 4
						}}
					/>
					<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 1}}>
						{formatNumberString(lpItem.estimatedAmountA, 6, 0)}{' '}
					</CustomText>
					{/* <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>
						{lpItem.t1.symbol}
					</CustomText> */}
				</View>
			</View>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%',
					marginTop: 16
				}}
			>
				<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>2nd Token</CustomText>
				<View style={{flexDirection: 'row', alignItems: 'center'}}>
					<Image
						source={{uri: lpItem.t2.logo}}
						style={{
							width: 20,
							height: 20,
							marginRight: 4
						}}
					/>
					<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 1}}>
						{formatNumberString(lpItem.estimatedAmountB, 6, 0)}{' '}
					</CustomText>
					{/* <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>{lpItem.t2.symbol}</CustomText> */}
				</View>
			</View>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%',
					marginTop: 16
				}}
			>
				<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>
					{getLanguageString(language, 'POSITION')}
				</CustomText>
				<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 1}}>{formatNumberString(parseDecimals(lpItem.balance, 18), 6)}</CustomText>
			</View>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
					width: '100%',
					marginTop: 16
				}}
			>
				<TouchableOpacity onPress={() => setShowWithdraw(true)}>
					<CustomText style={{color: theme.urlColor, fontSize: theme.defaultFontSize + 1}}>
						{getLanguageString(language, 'WITHDRAW')}
					</CustomText>
				</TouchableOpacity>
			</View>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%',
					marginTop: 16
				}}
			>
				<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>
					{getLanguageString(language, 'SHARE')}
				</CustomText>
				<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 1}}>
					{
						renderShare()
					}
				</CustomText>
			</View>
			<Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
			<Button
				title={getLanguageString(language, 'CANCEL')}
				onPress={onClose}
				type="outline"
				style={{width: '100%', marginBottom: 8}}
				textStyle={{
					fontWeight: '500',
					fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
				}}
			/>
			<Button
				title={getLanguageString(language, 'ADD_LP')}
				onPress={() => triggerAddLP(lpItem.contract_address)}
				textStyle={{
					fontWeight: '500',
					fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
				}}
			/>
		</CustomModal>
	)
}