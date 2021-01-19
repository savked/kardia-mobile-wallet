import {StyleSheet} from 'react-native';
import {HEADER_HEIGHT} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headline: {
    fontSize: 25,
    fontWeight: 'bold',
    // marginBottom: 20,
  },
});
