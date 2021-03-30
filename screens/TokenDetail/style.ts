import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  tokenLogo: {
    width: 48,
    height: 48,
    borderRadius: 25,
  },
  kaiLogo: {
    width: 24,
    height: 24,
  },
  buttonGroupContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  noTXText: {
    padding: 15,
    fontSize: 16,
    fontStyle: 'italic',
  },
  kaiAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },
  kaiCardContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 240,
    marginBottom: 16,
  },
  kaiCard: {
    borderRadius: 8,
    padding: 30,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardBackground: {
    flex: 1,
    top: 0,
    left: 0,
    height: 230,
    resizeMode: 'cover',
    position: 'absolute',
    borderRadius: 8,
  },
  kaiCardText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
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
