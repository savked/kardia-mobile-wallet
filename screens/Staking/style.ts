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
    justifyContent: 'space-between',
  },
  headline: {
    fontSize: 25,
    fontWeight: 'bold',
    // marginBottom: 20,
  },
  noStakingText: {
    // padding: 15,
    fontSize: 16,
    fontStyle: 'italic',
  },
  validatorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  actionContainer: {
    marginTop: 24,
    flexDirection: 'row',
  },
});
