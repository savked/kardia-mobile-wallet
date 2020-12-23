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
import * as Sentry from '@sentry/react-native';
import AppContainer from './screens/Container';
import themes from './theme/index';
import CustomStatusBar from './components/StatusBar';
import {SENTRY_DSN} from './config';

declare const global: {HermesInternal: null | {}};

const DEFAULT_THEME = themes.dark;
export const ThemeContext = React.createContext(DEFAULT_THEME);

Sentry.init({
  dsn: SENTRY_DSN,
});

const App = () => {
  return (
    <>
      <ThemeContext.Provider value={DEFAULT_THEME}>
        <CustomStatusBar
          barStyle="light-content"
          backgroundColor={DEFAULT_THEME.backgroundColor}
        />
        <SafeAreaProvider>
          <RecoilRoot>
            <MenuProvider>
              <AppContainer />
            </MenuProvider>
          </RecoilRoot>
        </SafeAreaProvider>
      </ThemeContext.Provider>
    </>
  );
};

export default App;
