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
    justifyContent: 'space-around',
  },

  centerText: {
    flex: 1,
    fontSize: 18,
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
});
