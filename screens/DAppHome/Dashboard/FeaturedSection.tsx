import { useNavigation } from '@react-navigation/core';
import React, { useContext } from 'react';
import { Image, Platform, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { parseURL, truncate } from '../../../utils/string';

export default ({appList}: {
  appList: DAppMeta[]
}) => {
  const theme = useContext(ThemeContext)
  const navigation = useNavigation()
  return (
    <>
      <CustomText 
        style={{
          paddingHorizontal: 20, 
          paddingBottom: 14,
          fontWeight: 'bold',
          fontSize: theme.defaultFontSize + 6,
          color: theme.textColor
        }}
      >
        Featured ({appList.length})
      </CustomText>
      <View style={{height: 250}}>
        <ScrollView
          horizontal
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1}}
        >
          {
            appList.map((app, index) => {
              return (
                <TouchableWithoutFeedback
                  key={`featured-app-${index}`}
                  onPress={() => {
                    if (!app.url) return;
                    const parsedURL = parseURL(app.url)
                    navigation.navigate('DAppBrowser', {
                      appURL: parsedURL,
                      allowLandscape: app.allowLandscape
                    })
                  }}
                >
                  <View
                    style={{
                      marginLeft: index === 0 ? 20 : 16,
                      marginRight: index === appList.length - 1 ? 20 : 0
                    }}
                  >
                    {
                      app.banner ? 
                      <Image
                        source={{uri: app.banner}}
                        style={{
                          width: 279,
                          height: 168,
                          resizeMode: 'cover',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12
                        }}
                      />
                      :
                      <View
                        style={{
                          backgroundColor: '#FFFFFF',
                          width: 279,
                          height: 168,
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12
                        }}
                      />
                    }
                    <View
                      style={{
                        backgroundColor: theme.backgroundFocusColor,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
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
                              fontSize: theme.defaultFontSize,
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
                                truncate(app.categories.join(', '), 20, -1) 
                              : ' '
                            }
                          </CustomText>
                        </View>
                      </View>
                      <View
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          backgroundColor: theme.backgroundLightColor
                        }}
                      >
                        <Icon
                          name="chevron-right"
                          color={theme.textColor}
                          size={20}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )
            })
          }
        </ScrollView>
      </View>
    </>
  )
}