import { StyleSheet } from 'react-native';
import { HEADER_HEIGHT } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headline: {
    fontSize: 36,
    // fontWeight: 'bold',
    // paddingHorizontal: 15,
  },
  settingItemContainer: {
    flexDirection: 'row',
    // paddingHorizontal: 15,
    // paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingTitle: {
    marginLeft: 15,
    fontSize: 15,
  },
});
