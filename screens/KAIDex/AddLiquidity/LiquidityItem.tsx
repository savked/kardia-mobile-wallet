import React, { useContext } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import CustomText from '../../../components/Text';
import { formatDexToken } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';
import { formatNumberString, parseDecimals } from '../../../utils/number';

export default ({lpItem}: {
	lpItem: Record<string, any>
}) => {
	const theme = useContext(ThemeContext)
	const language = useRecoilValue(languageAtom)
	
  return (
		<TouchableOpacity
			style={{
				backgroundColor: theme.backgroundFocusColor,
				borderRadius: 12,
				paddingVertical: 14,
				paddingHorizontal: 16,
				flexDirection: 'row'
			}}
		>
			<View style={{flexDirection: 'row', marginRight: 12}}>
				<View style={{width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16}}>
					<Image
						source={{uri: lpItem.t1.logo}}
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
						source={{uri: lpItem.t2.logo}}
						style={{width: 32, height: 32}}
					/>
				</View>
			</View>
			<View style={{flex: 1, justifyContent: 'space-between'}}>
				<CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 4}}>
					{formatDexToken(lpItem.t1).symbol} / {formatDexToken(lpItem.t2).symbol}
				</CustomText>
				<CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 2}}>
					{getLanguageString(language, 'SHARE')}: <CustomText style={{color: theme.textColor, fontWeight: 'bold'}}>{formatNumberString((lpItem.shareRate * 100).toString(), 2)}%</CustomText>
					{' | '}
					{getLanguageString(language, 'POSITION')}:{' '}
					<CustomText style={{color: theme.textColor, fontWeight: 'bold'}}>
						{formatNumberString(parseDecimals(lpItem.balance, 18), 6)}
					</CustomText>
				</CustomText>
			</View>
		</TouchableOpacity>
	)
}