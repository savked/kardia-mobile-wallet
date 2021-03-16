import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  kaiLogo: {
    width: 40,
    height: 40,
  },
  buttonGroupContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  noTXText: {
    padding: 15,
    fontSize: 16,
    fontStyle: 'italic',
  },
  kaiAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },
});
