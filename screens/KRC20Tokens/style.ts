import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  kaiLogo: {
    width: 20,
    height: 20,
  },
  tokenLogo: {
    width: 30,
    height: 30,
    borderRadius: 25,
  },
  kaiAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 52,
    minWidth: 52,
    width: 52,
    minHeight: 52,
    height: 52,
    borderRadius: 26,
    paddingVertical: 0,
  },
});
