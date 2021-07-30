import React, { useContext, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import WebView from 'react-native-webview';
import Button from '../../../components/Button';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';

export default ({
  pairItem
}: {
  pairItem: Pair
}) => {
  const theme = useContext(ThemeContext)
  const [loadingURL, setLoadingURL] = useState(false)

  const chartRef = useRef<any>()

  return (
    <View style={{
      flex: 1,
      paddingBottom: 12,
      minHeight: 500
    }}>
      {
        loadingURL &&
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" />
          </View>
      }
      <WebView
        ref={chartRef}
        style={{flex: 1}}
        automaticallyAdjustContentInsets={false}
        javaScriptEnabled={true}
        source={{ uri: `https://kaidex.io/fullychart/${pairItem.contract_address}` }}
        onLoadStart={() => setLoadingURL(true)}
        onLoadEnd={async () => setLoadingURL(false)}
        originWhitelist={["*"]}
        containerStyle={{
          flex: loadingURL ? 0 : 1,
          backgroundColor: theme.backgroundColor
        }}
        renderError={(errorName) => {
          if (!errorName) return <CustomText>{''}</CustomText>;
          return (
            <View style={{backgroundColor: theme.backgroundColor, height: '100%', alignItems: 'center', justifyContent: 'center'}}>
              <CustomText 
                style={{
                  color: theme.textColor,
                  fontSize: 30,
                  marginBottom: 30,
                  fontWeight: '500',
                  fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                }}
              >
                Error loading chart
              </CustomText>
              <CustomText style={{color: theme.textColor}}>Error code: {errorName}</CustomText>
              <Button
                type="outline"
                title="Retry"
                style={{
                  marginTop: 12,
                  paddingHorizontal: 24
                }}
                onPress={() => {
                  if (chartRef && chartRef.current) {
                    chartRef.current.reload()
                  }
                }}
              />
            </View>
          )
        }}
      />
    </View>
  )
}