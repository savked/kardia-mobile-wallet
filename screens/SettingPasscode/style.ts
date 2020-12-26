import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
  otpInput: {
    borderColor: '#FFFFFF',
    borderWidth: 1,
    textAlign: 'center',
    width: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  otpContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  settingTitle: {
    marginLeft: 15,
    fontSize: 18,
  },
});
