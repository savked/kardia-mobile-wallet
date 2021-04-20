import {StyleSheet} from 'react-native';
import { HEADER_HEIGHT } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  addressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressAvatarContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  headline: {
    fontSize: 36,
    // fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    paddingHorizontal: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 138,
  },
  noAvatarContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
