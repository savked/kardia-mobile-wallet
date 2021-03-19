import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  tokenLogo: {
    width: 65,
    height: 65,
  },
  kaiLogo: {
    width: 65,
    height: 65,
  },
  tokenBalance: {
    fontSize: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 8,
    width: '100%',
  },
  infoTitle: {
    fontStyle: 'italic',
  },
  infoValue: {
    fontWeight: 'bold',
  },
});
