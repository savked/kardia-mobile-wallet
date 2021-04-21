import { StyleSheet } from "react-native";
import { HEADER_HEIGHT } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headline: {
    fontSize: 36,
    // fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
});
