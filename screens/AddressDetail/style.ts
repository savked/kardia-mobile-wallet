import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 14,
  },
  formFieldContainer: {
    marginBottom: 14,
  },
  avatarPickerContainer: {
    alignItems: 'center',
  },
  button: {
    width: '45%',
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  removeButtonContainer: {
    marginRight: 14,
  },
  removeButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noTXText: {
    paddingVertical: 8,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  kaiLogo: {
    width: 30,
    height: 30,
  },
  kaiAmount: {
    fontWeight: 'bold',
  },
});
