import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  otpInput: {
    textAlign: 'center',
    width: 52,
    height: 64,
    padding: 0,
    borderRadius: 8,
    fontSize: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    // marginBottom: 12,
  },
});
