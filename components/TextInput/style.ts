import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  input: {
    borderRadius: 8,
    height: 44,
    // minWidth: 100,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    color: '#000000',
  },
  multiline: {
    height: 120,
  },
  headline: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textIcon: {
    position: 'absolute',
    right: 15,
  },
  errorMessage: {
    fontStyle: 'italic',
    marginTop: 8,
    color: 'red',
  },
});
