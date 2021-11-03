import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  headline: {
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
    marginBottom: 5,
  },
  selectContainer: {
    width: '100%',
    borderRadius: 8,
    borderColor: 'rgba(154, 163, 178, 1)',
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(96, 99, 108, 1)',
    flexDirection: 'row'
  },
  errorMessage: {
    fontStyle: 'italic',
    marginTop: 8,
    color: 'red',
  },
});