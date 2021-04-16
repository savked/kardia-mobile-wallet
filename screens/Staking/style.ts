import {StyleSheet} from 'react-native';
import {HEADER_HEIGHT} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 15,
    paddingHorizontal: 20,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 20,
    justifyContent: 'space-between',
  },
  headline: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  noStakingText: {
    // padding: 15,
    fontSize: 15,
    // fontStyle: 'italic',
  },
  validatorName: {
    fontSize: 18,
    // fontStyle: 'italic',
    fontWeight: 'bold',
    // marginBottom: 18,
  },
  actionContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  totalSaving: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 32,
    paddingVertical: 14,
    marginRight: 12,
  },
  headerButtonGroup: {
    flexDirection: 'row',
    padding: 20,
    width: '100%',
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
