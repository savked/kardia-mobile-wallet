import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 0,
    padding: 15,
    flex: 1,
  },
  headline: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  highlight: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },

  highlightImg: {
    minWidth: '100%',
    height: 175,
    borderRadius: 8,
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: 'white',
  },

  left: {
    marginRight: 5,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  right: {
    marginLeft: 5,
    flexDirection: 'column',
    flexShrink: 1,
  },

  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },

  description: {
    fontSize: 14,
    marginBottom: 5,
  },

  time: {
    fontSize: 14,
  },
});
