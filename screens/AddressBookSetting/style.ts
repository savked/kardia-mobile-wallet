import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addressAvatarContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  addressAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addressName: {
    fontSize: 16,
  },
  addressHash: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyAddressBook: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 15,
  },
  noAddressContainer: {
    flex: 1,
    paddingHorizontal: 83,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
