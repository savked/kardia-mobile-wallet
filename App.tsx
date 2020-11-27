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
import AppContainer from './screens/Container';

declare const global: {HermesInternal: null | {}};

const App = () => {

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaProvider>
        <RecoilRoot>
          <AppContainer />
        </RecoilRoot>
      </SafeAreaProvider>
    </>
  );
};

export default App;
