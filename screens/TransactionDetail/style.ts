import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 120,
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
  txMeta: {
    width: '100%',
    paddingVertical: 55,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  statusContainer: {
    padding: 6,
    width: '100%',
  },
  statusText: {
    fontStyle: 'italic',
  },
});
