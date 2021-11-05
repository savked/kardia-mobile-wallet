import { Platform, StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
  },
});
