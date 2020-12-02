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

declare const global: {HermesInternal: null | {}};

export const ThemeContext = React.createContext(themes.dark);

const App = () => {

  return (
    <>
      <ThemeContext.Provider value={themes.dark}>
        <StatusBar barStyle="light-content" />
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
