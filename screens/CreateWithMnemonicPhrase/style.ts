import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 70,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  paragraph: {
    marginBottom: 10,
    paddingHorizontal: 20,
    textAlign: 'justify',
  },
  description: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  buttonGroupContainer: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
  },
  phraseItemContainer: {
    borderRadius: 8,
    // flex: 1,
    padding: 10,
    margin: 5,
  },
  phraseItemText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
