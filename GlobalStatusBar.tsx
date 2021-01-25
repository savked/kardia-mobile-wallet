import React from 'react';
import {useRecoilValue} from 'recoil';
import {statusBarColorAtom} from './atoms/statusBar';
import CustomStatusBar from './components/StatusBar';

const GlobalStatusBar = () => {
  const statusBarColor = useRecoilValue(statusBarColorAtom);
  return (
    <CustomStatusBar
      barStyle="light-content"
      backgroundColor={statusBarColor}
    />
  );
};

export default GlobalStatusBar;
