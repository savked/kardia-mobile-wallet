import {StyleSheet} from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  logo: {
    width: 40,
    height: 40,
  },
  txhash: {
    textAlign: 'center',
    color: 'rgba(252, 252, 252, 0.54)',
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  newContactAvatarContainer: {
    backgroundColor: '#F7F7F8',
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
