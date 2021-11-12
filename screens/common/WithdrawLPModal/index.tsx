import { useNavigation } from '@react-navigation/core';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { cacheSelector } from '../../../atoms/cache';
import { languageAtom } from '../../../atoms/language';
import { pendingTxSelector } from '../../../atoms/pendingTx';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import Divider from '../../../components/Divider';
import CustomModal from '../../../components/Modal';
import Tags from '../../../components/Tags';
import CustomText from '../../../components/Text';
import CustomTextInput from '../../../components/TextInput';
import { useKeyboardHook } from '../../../hooks/isKeyboardShown';
import { approveToken, calculateTransactionDeadline, getApproveState, removeLiquidity } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { parseSymbolWKAI } from '../../../utils/dex';
import { getLanguageString } from '../../../utils/lang';
import { formatNumberString, getDecimalCount, getDigit, getPartial, isNumber, parseDecimals } from '../../../utils/number';
import TxSettingModal from '../../KAIDex/TxSettingModal';
import AuthModal from '../AuthModal';

export default ({visible, onClose, lpItem, onSuccess, refreshLP}: {
	visible: boolean;
	onClose: () => void;
	lpItem?: any;
	onSuccess: () => void
	refreshLP: () => void
}) => {

	const navigation = useNavigation()
	const theme = useContext(ThemeContext);
	const language = useRecoilValue(languageAtom)
	const [lpAmount, setLPAmount] = useState('')
	const [error, setError] = useState('')
	const [keyboardOffset, setKeyboardOffset] = useState(0);
	const [showAuthModal, setShowAuthModal] = useState(false)
	const [showTxSettingModal, setShowTxSettingModal] = useState(false)

	const [approvalState, setApprovalState] = useState(false)

	const wallets = useRecoilValue(walletsAtom)
	const selectedWallet = useRecoilValue(selectedWalletAtom)
	const [txDeadline, setTxDeadline] = useRecoilState(cacheSelector('txDeadline'))
  const [slippageTolerance, setSlippageTolerance] = useRecoilState(cacheSelector('slippageTolerance'))
	const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallets[selectedWallet].address))

	const [withdrawing, setWithdrawing] = useState(false)

	useEffect(() => {
		(async () => {
			if (!lpItem) return
			const state = await getApproveState({
				hash: lpItem.contract_address,
				decimals: 18
			} as any, parseDecimals(lpItem.balance, 18), wallets[selectedWallet])

			setApprovalState(state)
		})()
	}, [lpItem])

	const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
  };

	useKeyboardHook(_keyboardDidShow, _keyboardDidHide)

	const getContentStyle = () => {
		return {
			backgroundColor: theme.backgroundFocusColor,
			height: 460,
			padding: 20,
			paddingTop: 34,
			justifyContent: 'flex-start',
			marginBottom: Platform.OS === 'android' ? 0 : keyboardOffset,
			marginTop: Platform.OS === 'android' ? 0 : -keyboardOffset
		}
	}

	if (!lpItem) return null

	const calculateRatio = () => {
		const totalLPBN = new BigNumber(parseDecimals(lpItem.balance, 18))
		const amountBN = new BigNumber(getDigit(lpAmount))
		return amountBN.dividedBy(totalLPBN)
	}

	const renderOutput = (reserve: string, raw = false) => {
		if (!lpAmount) return '0'
		const ratioBN = calculateRatio()
		const reserveBN = new BigNumber(reserve)
		const rs = reserveBN.multipliedBy(ratioBN)
		if (raw) return rs.toFixed()
		return formatNumberString(rs.toFixed(), 6, 1)
	}

	const handleWithdraw = async () => {
		try {
			setWithdrawing(true)
			const params = {
				pair: {
					balance: lpItem.balance,
					pairAddress: lpItem.contract_address,
					tokenA: {
						tokenAddress: lpItem.t1.hash,
						name: lpItem.t1.name,
						symbol: lpItem.t1.symbol,
						decimals: lpItem.t1.decimals
					},
					tokenB: {
						tokenAddress: lpItem.t2.hash,
						name: lpItem.t2.name,
						symbol: lpItem.t2.symbol,
						decimals: lpItem.t2.decimals
					},
					provider: lpItem.provider,
					pooledTokens: lpItem.pooledTokens
				},
        withdrawAmount: (new BigNumber(getDigit(lpAmount))).multipliedBy(new BigNumber(10 ** 18)).toFixed(),
        walletAddress: wallets[selectedWallet].address,
        slippageTolerance,
        txDeadline: await calculateTransactionDeadline(txDeadline as string),
			}

			const rs = await removeLiquidity(params, wallets[selectedWallet])

			setWithdrawing(false)
			onSuccess()
			setPendingTx(rs)
			navigation.navigate('SuccessTx', {
        type: 'withdrawLP',
        txHash: rs,
        token0: renderOutput(lpItem.estimatedAmountA, true),
				token1: renderOutput(lpItem.estimatedAmountB, true),
				refreshLP,
				lpPair: lpItem
      });

		} catch (error) {
			console.log(error)
			setWithdrawing(false)
			setError(getLanguageString(language, 'GENERAL_ERROR'))
		}
	}

	const submit = () => {
		let isValid = true
		setError('')
		const totalLPBN = new BigNumber(parseDecimals(lpItem.balance, 18))
		const amountBN = new BigNumber(getDigit(lpAmount))
		if (amountBN.isGreaterThan(totalLPBN)) {
			isValid = false
			setError(getLanguageString(language, 'NOT_ENOUGH_LP'))
		}

		if (!isValid) return
		setShowAuthModal(true)
	}

	const approve = async () => {
		try {
			setWithdrawing(true)
			const rs = await approveToken({
				hash: lpItem.contract_address,
				decimals: 18
			} as any, parseDecimals(lpItem.balance, 18), wallets[selectedWallet])

			if (rs.status === 1) {
				setWithdrawing(false)
				setApprovalState(true)
			} else {
				setWithdrawing(false)
				setError(getLanguageString(language, 'APPROVE_ERROR'))
			}
		} catch (error) {
			console.log('Approve fail', error)
			setWithdrawing(false)
			setError(getLanguageString(language, 'APPROVE_ERROR'))
		}
	}

	if (showAuthModal) {
		return (
			<AuthModal
				visible={showAuthModal}
				onClose={() => {
					setShowAuthModal(false)
				}}
				onSuccess={handleWithdraw}
			/>
		)
	}

	if (showTxSettingModal) {
		return (
			<TxSettingModal
				visible={showTxSettingModal}
				slippageTolerance={slippageTolerance as string}
				deadline={txDeadline as string}
				onClose={() => {
					setShowTxSettingModal(false);
				}}
				onSubmit={(newDeadline, newSlippageTolerance) => {
					setTxDeadline(newDeadline);
					setSlippageTolerance(newSlippageTolerance);
					setShowTxSettingModal(false);
				}}
			/>
		)
	}

	const shouldHighight = () => {
    if (!lpAmount) return false
    const val14 = parseDecimals(getPartial(lpItem.balance, 0.25, 18), 18)
    const val24 = parseDecimals(getPartial(lpItem.balance, 0.5, 18), 18)
    const val34 = parseDecimals(getPartial(lpItem.balance, 0.75, 18), 18)
    const val44 = parseDecimals(getPartial(lpItem.balance, 1, 18), 18)
    if (val14 === val24 || val14 === val34 || val14 === val44) return false
    if (val24 === val34 || val24 === val44) return false
    if (val34 === val44) return false
    return true
  }

	const getRatio = () => {
		const lpAmountBN = new BigNumber(lpAmount)
		const balanceBN = (new BigNumber(lpItem.balance)).dividedBy(new BigNumber(10 ** 18))
		return lpAmountBN.dividedBy(balanceBN).toNumber()
	}

	return (
		<CustomModal
			visible={visible}
			onClose={onClose}
			showCloseButton={false}
			contentStyle={getContentStyle()}
		>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
				<View style={{width: '100%'}}>
					<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 8}}>
						<CustomText
							style={{
								color: theme.textColor
							}}
						>
							LP Tokens
						</CustomText>
						<CustomText
							style={{
								color: theme.mutedTextColor
							}}
						>
							Balance:{' '}
							<CustomText style={{
								color: theme.textColor
							}}>{formatNumberString(parseDecimals(lpItem.balance, 18), 6, 0)}</CustomText>
						</CustomText>
					</View>
					<View style={{justifyContent: 'flex-start'}}>
						<CustomTextInput
							keyboardType={Platform.OS === 'android' ? "decimal-pad" : "numbers-and-punctuation"}
							message={error}
							value={lpAmount}
							onChangeText={(newValue) => {
								const digitOnly = getDigit(newValue, true);
								if (digitOnly === '') {
									setLPAmount('0')
								}
								if (getDecimalCount(newValue) > 18) {
									return;
								}
							
								if (isNumber(digitOnly)) {
									let formatedValue = formatNumberString(digitOnly);

									const [numParts, decimalParts] = digitOnly.split('.')

									if (!decimalParts && decimalParts !== "") {
										setLPAmount(formatedValue);
										return
									}

									formatedValue = formatNumberString(numParts) + '.' + decimalParts

									// if (newValue[newValue.length - 1] === '.') formatedValue += '.'
									// else if (newValue[newValue.length - 2] === '.' && newValue[newValue.length - 1] === '0') formatedValue += '.0'
									setLPAmount(formatedValue)
								}
							}}
							inputStyle={{
								backgroundColor: 'rgba(96, 99, 108, 1)',
								color: theme.textColor
							}}
						/>
					</View>
					<View style={{flexDirection: 'row', marginTop: 12}}>
						<Tags 
							content={`25 %`} 
							active={lpItem.balance !== '0' && shouldHighight() && getRatio() === 0.25 } 
							containerStyle={{marginRight: 12}} 
							onPress={() => {

								const partialValue = getPartial(lpItem.balance, 0.25, 18)
								setLPAmount(formatNumberString(parseDecimals(partialValue, 18), 18))
							}} 
						/>
						<Tags 
							content={`50 %`} 
							active={lpItem.balance !== '0' && shouldHighight() && getRatio() === 0.5 } 
							containerStyle={{marginRight: 12}} 
							onPress={() => {
								
								const partialValue = getPartial(lpItem.balance, 0.5, 18)
								setLPAmount(formatNumberString(parseDecimals(partialValue, 18), 18))
							}}
						/>
						<Tags 
							content={`75 %`} 
							active={lpItem.balance !== '0' && shouldHighight() && getRatio() === 0.75 } 
							containerStyle={{marginRight: 12}} 
							onPress={() => {

								const partialValue = getPartial(lpItem.balance, 0.75, 18)
								setLPAmount(formatNumberString(parseDecimals(partialValue, 18), 18))
							}}
						/>
						<Tags 
							content={`100 %`} 
							active={lpItem.balance !== '0' && shouldHighight() && getRatio() === 1 } 
							onPress={() => {

								const partialValue = getPartial(lpItem.balance, 1, 18)
								setLPAmount(formatNumberString(parseDecimals(partialValue, 18), 18))
							}} 
						/>
					</View>
					<Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
					<View style={{flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<Image
								source={{uri: lpItem.t1.logo}}
								style={{
									width: 20,
									height: 20,
									marginRight: 4
								}}
							/>
							<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>
							{parseSymbolWKAI(lpItem.t1.symbol)}
							</CustomText>
						</View>
						<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 1}}>
							{renderOutput(lpItem.estimatedAmountA)}
						</CustomText>
					</View>
					<View style={{flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: 8}}>
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<Image
								source={{uri: lpItem.t2.logo}}
								style={{
									width: 20,
									height: 20,
									marginRight: 4
								}}
							/>
							<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>
								{parseSymbolWKAI(lpItem.t2.symbol)}
							</CustomText>
						</View>
						<CustomText style={{color: theme.textColor, fontSize: theme.defaultFontSize + 1}}>
							{renderOutput(lpItem.estimatedAmountB)}
						</CustomText>
					</View>
					<TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginTop: 24}} onPress={() => setShowTxSettingModal(true)}>
						<Image style={{width: 16, height: 16, marginRight: 4}} source={require('../../../assets/icon/setting_dark.png')} />
						<CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'TX_SETTING')}</CustomText>
					</TouchableOpacity>
					<Divider height={0.5} style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 2}} />
					<Button
						title={getLanguageString(language, 'CANCEL')}
						onPress={onClose}
						disabled={withdrawing}
						type="outline"
						style={{
							width: '100%',
							marginBottom: 8
						}}
						textStyle={{
							fontWeight: '500',
							fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
						}}
					/>
					<Button
						disabled={withdrawing}
						loading={withdrawing}
						title={approvalState === true ? getLanguageString(language, 'WITHDRAW') : getLanguageString(language, 'APPROVE')}
						onPress={() => {
							if (pendingTx) {
								Alert.alert(getLanguageString(language, 'HAS_PENDING_TX'));
								return;
							}
							approvalState === true ? submit() : approve()
						}}
						textStyle={{
							fontWeight: '500',
							fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
						}}
					/>
				</View>
			</TouchableWithoutFeedback>
		</CustomModal>
	)
}