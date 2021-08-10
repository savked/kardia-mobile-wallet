import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import Tags from '../../../components/Tags';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';
import { parseURL, truncate } from '../../../utils/string';

export default ({appList}: {
  appList: DAppMeta[]
}) => {
  const theme = useContext(ThemeContext)
  const navigation = useNavigation()
  const language = useRecoilValue(languageAtom)

  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState('All')

  useEffect(() => {
    let l: string[] = ['All'];
    appList.forEach((item) => {
      if (item.categories) {
        const filtered = item.categories.filter((item) => !l.includes(item))
        l = [...l, ...filtered]
      }
    })
    setCategoryList(l)
  }, [appList])

  const filteredApp = () => {
    if (selectedCat === 'All') return appList;
    return appList.filter((item) => {
      if (!item.categories) return false
      return item.categories.includes(selectedCat)
    })
  }

  return (
    <>
      <CustomText 
        style={{
          color: theme.textColor, 
          paddingHorizontal: 20,
          fontWeight: 'bold',
          fontSize: theme.defaultFontSize + 6,
          marginVertical: 12
        }}
      >
        {getLanguageString(language, 'ALL_DAPPS')} ({appList.length})
      </CustomText>
      <View
        style={{height: 28, marginBottom: 20}}
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
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {
            filteredApp().map((app, index) => {
              return (
                <TouchableOpacity
                  key={`app-item-${index}`}
                  style={{
                    backgroundColor: theme.backgroundFocusColor,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                  }}
                  onPress={() => {
                    if (!app.url) return;
                    const parsedURL = parseURL(app.url)
                    navigation.navigate('DAppBrowser', {
                      appURL: parsedURL,
                      allowLandscape: app.allowLandscape
                    })
                  }}
                >
                  <View style={{flexDirection: 'row'}}>
                    <Image
                      source={{uri: app.icon}}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 12,
                        marginRight: 8
                      }}
                    />
                    <View style={{justifyContent: 'space-between'}}>
                      <CustomText 
                        style={{
                          color: theme.textColor, 
                          fontSize: theme.defaultFontSize + 1,
                          fontWeight: '500',
                          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                        }}
                      >
                        {app.name}
                      </CustomText>
                      <CustomText 
                        style={{
                          color: theme.mutedTextColor, 
                          fontSize: theme.defaultFontSize,
                          fontWeight: '500',
                          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                        }}
                      >
                        {
                          app.categories ? 
                            truncate(app.categories.join(', '), 40, -1) 
                          : ' '
                        }
                      </CustomText>
                    </View>
                  </View>
                  <View
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: theme.backgroundLightColor
                    }}
                  >
                    <Icon
                      name="chevron-right"
                      color={theme.textColor}
                      size={16}
                    />
                  </View>
                </TouchableOpacity>
              )
            })
          }
        </ScrollView>
      </View>
    </>
  )
}