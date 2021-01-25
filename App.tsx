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
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RecoilRoot} from 'recoil';
import {MenuProvider} from 'react-native-popup-menu';
import AppContainer from './screens/Container';
import themes from './theme/index';
import ErrorBoundary from './screens/ErrorBoundary';
import {ThemeContext} from './ThemeContext';
import GlobalStatusBar from './GlobalStatusBar';

declare const global: {HermesInternal: null | {}};

const DEFAULT_THEME = themes.dark;
export {ThemeContext};

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
      </ThemeContext.Provider>
    </RecoilRoot>
  );
};

export default App;
