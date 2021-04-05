import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 20,
    justifyContent: 'space-between'
  },
  kaiCardText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  kaiCard: {
    borderRadius: 8,
    // padding: 25,
    // flex: 1,
    justifyContent: 'space-between',
  },
  cardImage: {
    width: 52,
    height: 32,
    resizeMode: 'contain',
    marginRight: 16,
  },
  walletItemContainer: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    marginVertical: 5,
  },
});
