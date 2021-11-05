import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  addressContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyAddressBook: {
    fontSize: 16,
    padding: 15,
  },
  addressHash: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  addressAvatarContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  addressName: {
    fontSize: 16,
  },
});
