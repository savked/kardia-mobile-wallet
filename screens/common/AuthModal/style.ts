import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  otpInput: {
    textAlign: 'center',
    width: 52,
    height: 64,
    color: '#FFFFFF',
    fontSize: 30,
    // paddingHorizontal: 0,
    // paddingVertical: 0,
    padding: 0,
    borderRadius: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-between',
    // marginBottom: 12,
  },
});
