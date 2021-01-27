import {StyleSheet} from 'react-native';
import {SEARCH_INPUT_HEIGHT} from '../Transactions/style';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 16,
    height: SEARCH_INPUT_HEIGHT,
  },
  validatorItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});
