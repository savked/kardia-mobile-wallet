import React, { useContext } from 'react';
import { Image, Linking, Platform, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import {format} from 'date-fns';
import { languageAtom } from '../../../atoms/language';
import CustomModal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { getOrderPrice, getOrderTotal, isBuy, parseSymbolWKAI } from '../../../utils/dex';
import { formatNumberString } from '../../../utils/number';
import {styles} from './styles'
import { getDateFNSLocale, getLanguageString } from '../../../utils/lang';
import { copyToClipboard, getLogoURL, getTxURL, truncate } from '../../../utils/string';
import Toast from 'react-native-toast-message';
import Divider from '../../../components/Divider';
import Button from '../../../components/Button';

export default ({
	visible,
	onClose,
	orderObj
}: {
	visible: boolean;
	onClose: () => void;
	orderObj: Record<string, any>
}) => {

	const theme = useContext(ThemeContext)
	const language = useRecoilValue(languageAtom)
	const dateLocale = getDateFNSLocale(language);

	const getModalStyle = () => {
		return {
			backgroundColor: theme.backgroundFocusColor,
			height: 470
		}
	}

	const handleClickLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    });
  };

	if (!orderObj) {
		return null
	}

	return (
		<CustomModal
			visible={visible}
			onClose={onClose}
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
					{isBuy(orderObj) ? (
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
            {formatNumberString(isBuy(orderObj) ? orderObj.amount0Out : orderObj.amount0In, 4)}
          </CustomText>
          <CustomText style={{color: theme.textColor, fontSize: 18}}>
						{parseSymbolWKAI(orderObj.pair.token0.symbol)}
					</CustomText>
        </View>
				<View style={{backgroundColor: '#212121', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginTop: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
          <CustomText style={{color: theme.textColor}}>
            {truncate(orderObj.transaction.id, 14, 14)}
          </CustomText>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => {
              copyToClipboard(orderObj.transaction.id)
              Toast.show({
                type: 'success',
                topOffset: 70,
                text1: getLanguageString(language, 'COPIED'),
              });
            }}>
              <Image source={require('../../../assets/icon/copy.png')} style={{width: 16, height: 16, marginRight: 12}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleClickLink(getTxURL(orderObj.transaction.id))}>
              <Image source={require('../../../assets/icon/external_url_dark.png')} style={{width: 16, height: 16}} />
            </TouchableOpacity>
          </View>
        </View>
				<Divider style={{width: '100%', backgroundColor: '#60636C'}} />
				<View style={{width: '100%'}}>
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
					{/* <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>Side</CustomText>
					</View> */}
					<View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingVertical: 6}}>
						<CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'PRICE')}</CustomText>
						<CustomText 
							style={{
								color: theme.textColor,
								fontWeight: '500',
								fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
							}}
						>
							{formatNumberString(getOrderPrice(orderObj).toFixed(), 6)}{' '}
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
								isBuy(orderObj) ? orderObj.amount0Out : orderObj.amount0In, 
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
								getOrderTotal(orderObj), 
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
					textStyle={{
						fontWeight: '500',
						fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
					}}
				/>
			</View>
		</CustomModal>
	)
}