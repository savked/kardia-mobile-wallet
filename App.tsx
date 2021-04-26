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
import Toast from 'react-native-toast-message';
import AppContainer from './screens/Container';
import themes from './theme/index';
import ErrorBoundary from './screens/ErrorBoundary';
import { ThemeContext } from './ThemeContext';
import GlobalStatusBar from './GlobalStatusBar';
import { Text, View } from 'react-native';
import CustomText from './components/Text';

declare const global: { HermesInternal: null | {} };

const DEFAULT_THEME = themes.dark;
export { ThemeContext };

const App = () => {
  return (
    <RecoilRoot>
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
                  <CustomText style={{color: (props as any).textColor || 'rgba(69, 188, 67, 1)', fontWeight: 'bold'}}>{text1}</CustomText>
                </View>
              )
            }
          } />
      </ThemeContext.Provider>
    </RecoilRoot>
  );
};

export default App;
