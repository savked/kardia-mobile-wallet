import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  walletItemContainer: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    marginVertical: 5,
  },
  cardImage: {
    width: 52,
    height: 32,
    resizeMode: 'contain',
  },
  cardImageContainer: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 2,
    shadowRadius: 4,
    elevation: 9,
    marginRight: 16,
    width: 52,
    height: 32,
  },
  pinButton: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 4,
    bottom: 6,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 2,
    shadowRadius: 4,
    elevation: 9,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 52,
    minWidth: 52,
    width: 52,
    minHeight: 52,
    height: 52,
    borderRadius: 26,
    paddingVertical: 0,
  },
});
