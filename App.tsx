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
import { StatusBar } from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { RecoilRoot } from 'recoil';
import { MenuProvider } from 'react-native-popup-menu';
import AppContainer from './screens/Container';
import themes from './theme/index'
import CustomStatusBar from './components/StatusBar';

declare const global: {HermesInternal: null | {}};

const DEFAULT_THEME = themes.dark
export const ThemeContext = React.createContext(DEFAULT_THEME);

const App = () => {

  return (
    <>
      <ThemeContext.Provider value={DEFAULT_THEME}>
        {/* <StatusBar barStyle="light-content" /> */}
        <CustomStatusBar barStyle="light-content" backgroundColor={DEFAULT_THEME.backgroundColor} />
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
