import { useNavigation } from '@react-navigation/core';
import React, { useContext } from 'react';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { parseURL } from '../../../utils/string';
import FavoriteDapp from '../FavoriteDapp';

export default ({url}: {url: string}) => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  return (
    <>
      <CustomText 
        style={{
          color: theme.textColor,
          fontWeight: 'bold', 
          marginHorizontal: 20,
          marginTop: 22,
          marginBottom: 8,
          fontSize: theme.defaultFontSize + 6
        }}
      >
        Result
      </CustomText>
      <FavoriteDapp keyword={url} onAppSelect={(app) =>{
        if (!app.url) return;
        const parsedURL = parseURL(app.url)
        navigation.navigate('DAppBrowser', {
          appURL: parsedURL,
          allowLandscape: app.allowLandscape
        })
      }} />
    </>
  )
}