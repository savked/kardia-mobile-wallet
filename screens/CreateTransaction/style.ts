import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 25,
    flex: 1,
    justifyContent: 'flex-start',
  },

  wrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
  emptyAddressBook: {
    fontSize: 16,
    padding: 15,
  },
  addressName: {
    fontSize: 16,
  },
  addressHash: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  addressContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  addressAvatarContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
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
});
