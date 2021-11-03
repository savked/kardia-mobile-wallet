import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  thumbnail: {
    width: 65,
    height: 65,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    // backgroundColor: '#15161A',
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 4,
  },

  left: {
    marginRight: 15,
  },
  right: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  description: {},

  time: {
    fontStyle: 'italic',
    color: 'gray',
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 20,
    color: 'gray',
    paddingVertical: 10,
  },
});
