import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import Tags from '../../../components/Tags';
import CustomText from '../../../components/Text';
import { getDefaultDApp } from '../../../services/dapp';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';
import AllDAppsSection from './AllDAppsSection';
import FeaturedSection from './FeaturedSection';

export default () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const [favDApp, setFavDApp] = useState<DAppMeta[]>([])

  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState('All')

  useEffect(() => {
    let l: string[] = ['All'];
    favDApp.forEach((item) => {
      if (item.categories) {
        const filtered = item.categories.filter((item) => !l.includes(item))
        l = [...l, ...filtered]
      }
    })
    setCategoryList(l)
  }, [favDApp])

	useEffect(() => {
		(async () => {
			const rs = await getDefaultDApp()
			setFavDApp(rs)
		})()
	}, [])
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      style={{
        marginTop: 14
      }}
      stickyHeaderIndices={[2]}
    >
      <FeaturedSection appList={favDApp.filter((item) => item.featured)} />
      <CustomText 
        style={{
          color: theme.textColor, 
          paddingHorizontal: 20,
          fontWeight: 'bold',
          fontSize: theme.defaultFontSize + 6,
          marginVertical: 12
        }}
      >
        {getLanguageString(language, 'ALL_DAPPS')} ({favDApp.length})
      </CustomText>
      <View
        style={{
          // height: 28, 
          paddingBottom: 8, 
          backgroundColor: theme.backgroundColor
        }}
      >
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {
            categoryList.map((cat, index) => {
              return (
                <Tags
                  key={`category-${index}`}
                  active={selectedCat === cat}
                  content={cat}
                  containerStyle={{
                    marginLeft: index === 0 ? 20 : 12,
                    marginRight: index === categoryList.length - 1 ? 20 : 0,
                    width: undefined,
                    minWidth: 70,
                    height: 28
                  }}
                  onPress={() => setSelectedCat(cat)}
                />
              )
            })
          }
        </ScrollView>
      </View>
      <AllDAppsSection appList={favDApp} selectedCat={selectedCat} />
    </ScrollView>
  )
}