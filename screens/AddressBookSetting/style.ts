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
    marginHorizontal: 20,
    borderRadius: 8,
  },
  addressAvatarContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  addressAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
  },
  addressName: {
    fontWeight: 'bold',
  },
  addressHash: {
    // fontSize: 13,
    // fontStyle: 'italic',
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
  noAvatarContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
