import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  qrScannerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
  },
  qrScannerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 30,
    color: '#000000',
    fontWeight: 'bold',
  },
});
