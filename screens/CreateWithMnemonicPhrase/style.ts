import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 70,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  paragraph: {
    marginVertical: 10,
    textAlign: 'justify',
  },
  description: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  buttonGroupContainer: {
    width: '100%',
    paddingVertical: 15,
  },
  phraseItemContainer: {
    // flex: 1,
    padding: 10,
    margin: 5,
  },
  phraseItemText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
