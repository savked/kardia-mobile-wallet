import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  addressContainer: {
    marginTop: 24,
    flexDirection: 'row',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 2,
    shadowRadius: 4,
    elevation: 9,
    backgroundColor: 'rgba(33, 33, 33, 1)',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  addressName: {
    fontWeight: 'bold',
  },
  addressHash: {
    // fontSize: 13,
    fontStyle: 'italic',
  },
  commissionRateText: {
    fontSize: 12,
  },
});
