import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, TouchableOpacity, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import CustomText from '../../components/Text'
import TextAvatar from '../../components/TextAvatar'
import { getDefaultDApp } from '../../services/dapp'
import { ThemeContext } from '../../ThemeContext'
import { truncate } from '../../utils/string'

const {width: viewportWidth} = Dimensions.get('window')
const ITEM_WIDTH = 64;
const CONTAINER_PADDING_HORIZONTAL = 20
const columns = 4
const marginLeft = (viewportWidth - 2 * CONTAINER_PADDING_HORIZONTAL - columns * ITEM_WIDTH) / (columns - 1)

const filterDApp = (keyword: string, appList: DAppMeta[]) => {
	if (keyword === '') return appList
	return appList.filter((app) => {
		if (app.name.toLowerCase().includes(keyword.toLowerCase())) return true
		if (app.url.toLowerCase().includes(keyword.toLowerCase())) return true
		return false;
	})
}

export default ({
	onAppSelect,
	keyword = ''
}: {
	onAppSelect: (app: DAppMeta) => void;
	keyword?: string
}) => {
	const theme = useContext(ThemeContext)

	const [favDApp, setFavDApp] = useState<DAppMeta[]>([])

	useEffect(() => {
		(async () => {
			const rs = await getDefaultDApp()
			setFavDApp(rs)
		})()
	}, [])

	return (
		<View style={{flex: 1, paddingHorizontal: CONTAINER_PADDING_HORIZONTAL, flexWrap: 'wrap'}}>
			<FlatList
				style={{flex: 1, width: '100%'}}
				contentContainerStyle={{flex: 1, width: '100%'}}
				data={filterDApp(keyword, favDApp)}
				numColumns={columns}
  			keyExtractor={(item, index) => index.toString()}
				renderItem={({item, index}) => {
					return (
						<TouchableOpacity
							onPress={() => onAppSelect(item)}
							style={{
								width: ITEM_WIDTH, 
								// height: ITEM_WIDTH, 
								marginLeft: index % columns === 0 ? 0 : marginLeft,
								marginBottom: 8
							}}
						>
							<View
								style={{
									backgroundColor: '#FFFFFF', 
									borderRadius: 8,
									marginBottom: 8,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{
									item.icon ? 
									<Image
										source={{uri: item.icon}}
										style={{
											width: ITEM_WIDTH,
											height: ITEM_WIDTH
										}}
									/> :
									<TextAvatar 
										type="square" 
										size={ITEM_WIDTH} 
										text={item.name} 
										backgroundColor={theme.backgroundFocusColor} 
										textStyle={{
											fontWeight: 'normal',
											fontSize: 40
										}}
									/>
								}
							</View>
							<CustomText style={{color: theme.textColor, textAlign: 'center'}}>{truncate(item.name, 6, -1)}</CustomText>
						</TouchableOpacity>
					)
				}}
			/>
		</View>
	)
}