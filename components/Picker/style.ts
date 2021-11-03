import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  headline: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export const pickerSelectStyles = StyleSheet.create({
  viewContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  inputIOS: {
    height: 44,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    height: 44,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingRight: 4,
  },
});
