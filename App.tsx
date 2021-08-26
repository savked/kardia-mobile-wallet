/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecoilRoot } from 'recoil';
import { MenuProvider } from 'react-native-popup-menu';
import AntIcon from 'react-native-vector-icons/AntDesign'
import Toast from 'react-native-toast-message';
import AppContainer from './screens/Container';
import themes from './theme/index';
import ErrorBoundary from './screens/ErrorBoundary';
import { ThemeContext } from './ThemeContext';
import GlobalStatusBar from './GlobalStatusBar';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import CustomText from './components/Text';

import { ApolloProvider } from '@apollo/client';
import { apolloKaiDexClient } from './services/dex/apolloClient';
import LinearGradient from 'react-native-linear-gradient';


// Initialize Apollo Client
// const client = new ApolloClient({
//   uri: HASURA_ENDPOINT,
//   cache: new InMemoryCache(),
//   headers: {
//     'x-hasura-admin-secret': HASURA_CREDENTIALS
//   }
// });


declare const global: { HermesInternal: null | {} };

const DEFAULT_THEME = themes.dark;
export { ThemeContext };

const App = () => {
  return (
    <RecoilRoot>
      <ApolloProvider client={apolloKaiDexClient}>
        <ThemeContext.Provider value={DEFAULT_THEME}>
          <GlobalStatusBar />
          <SafeAreaProvider>
            <ErrorBoundary>
              <MenuProvider>
                <AppContainer />
              </MenuProvider>
            </ErrorBoundary>
          </SafeAreaProvider>
          <Toast ref={(ref) => Toast.setRef(ref)}
            config={
              {
                success: ({ text1 = '', props = {}, ...rest }) => (
                  <View style={{ height: 32, minWidth: 77, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: (props as any).backgroundColor || '#DDFFDB', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                    <CustomText 
                      style={{
                        color: (props as any).textColor || 'rgba(69, 188, 67, 1)',
                        fontWeight: '500',
                        fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                      }}
                    >
                      {text1}
                    </CustomText>
                  </View>
                ),
                pendingTx: ({ text1 = '', text2 = '', props = {}, ...rest }) => (
                  <LinearGradient 
                    start={{x: 0, y: 0}}
                    locations={[0, 0.48, 1]}
                    end={{x: 1, y: 1}}
                    colors={[
                      'rgba(61, 78, 129, 1)',
                      'rgba(87, 83, 201, 1)',
                      'rgba(110, 127, 243, 1)',
                    ]}
                    style={{ 
                      height: 60, 
                      minWidth: 77, 
                      paddingHorizontal: 16, 
                      paddingVertical: 8,
                      borderRadius: 8, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexDirection: 'row'
                    }}
                  >
                    <View>
                      <Image
                        source={require('./assets/loading.gif')}
                        style={{
                          // flex: 1
                          width: 52,
                          height: 52
                        }}
                      />
                    </View>
                    <View style={{justifyContent: 'space-between', paddingHorizontal: 4}}>
                      <CustomText 
                        style={{
                          color: DEFAULT_THEME.textColor,
                          fontWeight: 'bold',
                          fontSize: DEFAULT_THEME.defaultFontSize + 3
                        }}
                      >
                        {text1}
                      </CustomText>
                      <CustomText 
                        style={{
                          color: DEFAULT_THEME.mutedTextColor,
                          fontWeight: '500',
                          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
                          fontSize: DEFAULT_THEME.defaultFontSize
                        }}
                      >
                        {text2}
                      </CustomText>
                    </View>
                    <View style={{marginLeft: 2}}>
                      <TouchableOpacity
                        onPress={(props as any).onIgnore}
                        style={{
                          borderColor: 'rgba(154, 163, 178, 1)',
                          borderRadius: 8,
                          borderWidth: 1.5,
                          padding: 8,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                      >
                        <AntIcon
                          name="close"
                          style={{
                            color: DEFAULT_THEME.textColor,
                            marginRight: 4
                          }}
                        />
                        <CustomText style={{color: DEFAULT_THEME.textColor, fontWeight: 'bold'}}>
                          Ignore
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                )
              }
            } />
        </ThemeContext.Provider>
      </ApolloProvider>
    </RecoilRoot>
  );
};

export default App;
