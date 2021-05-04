import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    flex: 1,
    justifyContent: 'flex-start',
  },

  wrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    // fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },

  mb5: {
    marginBottom: 5,
  },

  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  centerText: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 30,
    color: '#000000',
    fontWeight: 'bold',
  },

  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  textIcon: {
    position: 'absolute',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
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
  confirmText: {
    fontStyle: 'italic',
  },
  confirmContent: {
    fontWeight: 'bold',
  },
  confirmGroup: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24
  },
  headline: {
    fontWeight: '500',
    marginBottom: 5,
  },
});
