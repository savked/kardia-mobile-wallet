import {StyleSheet} from 'react-native';
import {HEADER_HEIGHT} from '../../theme';

export const SEARCH_INPUT_HEIGHT = 80;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  kaiAmount: {
    fontWeight: 'bold',
  },
  controlContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 22,
    height: SEARCH_INPUT_HEIGHT,
  },
  headline: {
    fontSize: 25,
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kaiLogo: {
    width: 30,
    height: 30,
  },
  noTXText: {
    padding: 15,
    fontSize: 16,
  },
});
