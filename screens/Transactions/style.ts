import { StyleSheet } from 'react-native';
import { HEADER_HEIGHT } from '../../theme';

export const SEARCH_INPUT_HEIGHT = 80;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  kaiAmount: {
    // fontWeight: '400',
  },
  controlContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 22,
    height: SEARCH_INPUT_HEIGHT,
  },
  headline: {
    fontSize: 36,
    // fontWeight: 'bold',
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 20,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kaiLogo: {
    width: 30,
    height: 30,
  },
  noTXText: {
    padding: 15,
    fontSize: 24,
    fontWeight: 'bold',
  },
  noTXContainer: {
    marginTop: 50,
    paddingHorizontal: 47,
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
