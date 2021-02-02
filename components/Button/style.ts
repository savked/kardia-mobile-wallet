import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    color: 'white',
  },
  icon: {
    marginRight: 8,
  },
  mediumButton: {
    paddingVertical: 13,
    minWidth: 118,
    minHeight: 44,
  },
  smallButton: {
    paddingVertical: 12,
    minWidth: 109,
    minHeight: 32,
  },
  largeButton: {
    paddingVertical: 6,
    minWidth: 150,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: '#AD182A',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FADACF',
  },
  secondaryButtonText: {
    color: '#AD182A',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: '#C9CED6',
    borderWidth: 1,
  },
  outlineButtonText: {
    color: '#000000',
  },
  ghostButton: {
    backgroundColor: '#F7F8F9',
  },
  ghostButtonText: {
    color: '#364766',
  },
  linkButton: {
    backgroundColor: 'transparent',
  },
  linkButtonText: {
    // color: '#3f70b0',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
