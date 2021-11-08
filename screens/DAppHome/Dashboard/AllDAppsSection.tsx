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

export default ({appList, selectedCat}: {
  appList: DAppMeta[];
  selectedCat: string;
}) => {
  const theme = useContext(ThemeContext)
  const navigation = useNavigation()

  const filteredApp = () => {
    if (selectedCat === 'All') return appList;
    return appList.filter((item) => {
      if (!item.categories) return false
      return item.categories.includes(selectedCat)
    })
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20
      }}
    >
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
    </View>
  )
}