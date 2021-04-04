import {StyleSheet} from 'react-native';

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
    marginRight: 16,
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
