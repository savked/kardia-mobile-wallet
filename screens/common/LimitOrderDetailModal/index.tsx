import { useNavigation } from '@react-navigation/core';
import { format } from 'date-fns';
import React, { useContext, useState } from 'react';
import { Alert, Image, Platform, View } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import { pendingTxSelector } from '../../../atoms/pendingTx';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import Divider from '../../../components/Divider';
import CustomModal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import { cancelOrder } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { parseSymbolWKAI } from '../../../utils/dex';
import { getDateFNSLocale, getLanguageString } from '../../../utils/lang';
import { formatNumberString, parseDecimals } from '../../../utils/number';
import { getLogoURL } from '../../../utils/string';
import AuthModal from '../AuthModal';
import { styles } from './styles';

export default ({
	visible,
	onClose,
	orderObj,
	refreshLimitOrders
}: {
	visible: boolean;
	onClose: () => void;
	orderObj: Record<string, any>,
	refreshLimitOrders: () => void
}) => {
	const navigation = useNavigation()
	const theme = useContext(ThemeContext)
	const language = useRecoilValue(languageAtom)
	const dateLocale = getDateFNSLocale(language);

	const wallet = useRecoilValue(walletsAtom)
	const selectedWallet = useRecoilValue(selectedWalletAtom)
	const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallet[selectedWallet].address))

	const [showAuthModal, setShowAuthModal] = useState(false)
	const [cancelling, setCancelling] = useState(false)
	const [error, setError] = useState('');

	const getModalStyle = () => {
		return {
			backgroundColor: theme.backgroundFocusColor,
			height: 530
		}
	}

	const handleCancelOrder = async () => {
		setCancelling(true)
		try {
			const txResult = await cancelOrder(orderObj.id, wallet[selectedWallet]);	
			setPendingTx(typeof txResult === 'string' ? txResult : txResult.transactionHash)

			navigation.navigate('SuccessTx', {
				type: 'dexLimitCancelOrder',
				pairAddress: orderObj.pair.id,
				orderID: orderObj.id,
				txHash: typeof txResult === 'string' ? txResult : txResult.transactionHash,
				refreshLimitOrders: refreshLimitOrders
			});

			onClose()

		} catch (error) {
			console.log('error')
			console.log(error)
		}
		setCancelling(false)
	}

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

	if (!orderObj) {
		return null
	}

	if (showAuthModal) {
		return (
			<AuthModal
				visible={showAuthModal}
				onClose={() => {
					setShowAuthModal(false)
				}}
				onSuccess={handleCancelOrder}
			/>
		)
	}

	return (
		<CustomModal
			visible={visible}
			onClose={() => {
				setError('')
				onClose()
			}}
			showCloseButton={false}
			contentStyle={getModalStyle()}
		>
			<View style={[styles.container]}>
				<View
					style={{
						width: 64,
						height: 64,

						borderRadius: 16,
						backgroundColor: theme.backgroundColor,

						justifyContent: 'center',
						alignItems: 'center',

						position: 'absolute',
						top: -67,

						shadowColor: 'rgba(0, 0, 0, 0.3)',
						shadowOffset: {
							width: 0,
							height: 4,
						},
						shadowOpacity: 2,
						shadowRadius: 4,
						elevation: 9,
					}}>
					{orderObj.tradeType === 0 ? (
						<Image
							source={require('../../../assets/icon/receive.png')}
							style={styles.logo}
						/>
					) : (
						<Image
							source={require('../../../assets/icon/send.png')}
							style={styles.logo}
						/>
					)}
				</View>
				<CustomText style={{fontSize: 12, color: theme.mutedTextColor, marginTop: 20, marginBottom: 12}}>
					{format(orderObj.date, 'hh:mm aa, E dd/MM/yyyy', {
						locale: dateLocale,
					})}
				</CustomText>
				<View style={{flexDirection: 'row', alignItems: 'center'}}>
          <CustomText
            allowFontScaling={false}
            style={[
              styles.amountText,
              {color: theme.textColor, marginRight: 12},
            ]}>
            {/* {parseKaiBalance(txObj.amount, true)} */}
            {formatNumberString(parseDecimals(orderObj.amount, orderObj.pair.token0.decimals), 4)}
          </CustomText>
          <CustomText style={{color: theme.textColor, fontSize: 18}}>
						{parseSymbolWKAI(orderObj.pair.token0.symbol)}
					</CustomText>
        </View>
				<Divider style={{width: '100%', backgroundColor: '#60636C'}} />
				<View style={{width: '100%'}}>
					<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'LIMIT_ORDER_ID')}</CustomText>
						<CustomText 
							style={{
								color: theme.textColor,
								fontWeight: '500',
								fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
							}}
						>
							#{orderObj.id}
						</CustomText>
					</View>
					<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'PAIR')}</CustomText>
						<View style={{flexDirection: 'row'}}>
							<View style={{width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16}}>
								<Image
									source={{uri: getLogoURL(orderObj.pair.token0.id)}}
									style={{width: 32, height: 32}}
								/>
							</View>
							<View 
								style={{
									width: 32,
									height: 32,
									backgroundColor: '#FFFFFF',
									borderRadius: 16,
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
									source={{uri: getLogoURL(orderObj.pair.token1.id)}}
									style={{width: 32, height: 32}}
								/>
							</View>
						</View>
					</View>
					<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'ORDER_STATUS')}</CustomText>
						{renderBadge(orderObj.status)}
					</View>
					<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'PRICE')}</CustomText>
						<CustomText 
							style={{
								color: theme.textColor,
								fontWeight: '500',
								fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
							}}
						>
							{formatNumberString(orderObj.price, 6)}{' '}
							<CustomText style={{color: theme.mutedTextColor, fontWeight: 'normal'}}>{parseSymbolWKAI(orderObj.pair.token1.symbol)}</CustomText>
						</CustomText>
					</View>
					<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'AMOUNT')}</CustomText>
						<CustomText
							style={{
								color: theme.textColor,
								fontWeight: '500',
								fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
							}}>
							{formatNumberString(
								parseDecimals(orderObj.amount, orderObj.pair.token0.decimals), 
								6
							)}{' '}
							<CustomText style={{color: theme.mutedTextColor, fontWeight: 'normal'}}>
								{parseSymbolWKAI(orderObj.pair.token0.symbol)}
							</CustomText>
						</CustomText>
					</View>
					<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>Total</CustomText>
						<CustomText
							style={{
								color: theme.textColor,
								fontWeight: '500',
								fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
							}}>
							{formatNumberString(
								parseDecimals(orderObj.total, orderObj.pair.token1.decimals),
								6
							)}{' '}
							<CustomText style={{color: theme.mutedTextColor, fontWeight: 'normal'}}>
								{parseSymbolWKAI(orderObj.pair.token1.symbol)}
							</CustomText>
						</CustomText>
					</View>
				</View>
				<Divider style={{width: '100%', backgroundColor: '#60636C'}} />
				<Button
					onPress={onClose}
					title={getLanguageString(language, 'OK_TEXT')}
					type="outline"
					textStyle={{
						fontWeight: '500',
						fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
					}}
					style={{
						width: '100%'
					}}
				/>
				{
					orderObj.status === 1 &&
					<Button
						block
						loading={cancelling}
						loadingColor={theme.textColor}
						title={getLanguageString(language, 'CANCEL_ORDER')}
						type="ghost"
						style={{
							marginTop: 12,
							backgroundColor: 'rgba(208, 37, 38, 1)',
						}}
						textStyle={{
							color: '#FFFFFF',
							fontWeight: '500',
							fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
							fontSize: theme.defaultFontSize + 3
						}}
						onPress={() => {
							console.log('eee', pendingTx)
							if (pendingTx) {
								Alert.alert(getLanguageString(language, 'HAS_PENDING_TX'));
								return;
							}
							setShowAuthModal(true)
						}}
					/>
				}
				{
					error !== '' && 
					<CustomText
						style={{
							fontStyle: 'italic',
							marginTop: 2,
							color: 'red',
							marginBottom: 12
						}}
					>
						{error}
					</CustomText>
				}
			</View>
		</CustomModal>
	)
}