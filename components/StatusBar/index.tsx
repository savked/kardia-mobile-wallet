import React from 'react';
import {
    Platform,
    StatusBar,
    StatusBarProps,
    StyleSheet,
    View
} from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});

const CustomStatusBar = ({backgroundColor, ...props}: StatusBarProps) => (
  <View style={[styles.statusBar, {backgroundColor}]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

export default CustomStatusBar;
