import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 36,
  },
  otpInput: {
    // borderColor: '#FFFFFF',
    // borderWidth: 1,
    textAlign: 'center',
    width: 52,
    height: 64,
    // backgroundColor: '#FFFFFF',
    borderRadius: 8,
    fontSize: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-evenly',
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
