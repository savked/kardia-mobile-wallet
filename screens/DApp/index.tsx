import React from 'react';
import {Text, View, FlatList, Image} from 'react-native';
import {styles} from './style';

const DAppScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorer Kardia's ecosystem</Text>
      <FlatList
        numColumns={2}
        data={data}
        renderItem={({item}) => {
          return (
            <View style={styles.appContainer}>
              <Image
                style={styles.thumbnail}
                source={{
                  uri: 'https://reactnative.dev/img/tiny_logo.png',
                }}
              />
              <View>
                <Text>{item.title}</Text>
                {/* <Text>{item.description}</Text> */}
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item.title}
        ListEmptyComponent={<Text>No data</Text>}
      />
    </View>
  );
};

const data = [
  {
    id: 1,
    thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
    title: 'KAI Membership',
    description: 'Lorem Ipsum is simply dummy text',
  },
  {
    id: 2,
    thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
    title: 'KAIStarter',
    description: 'Lorem Ipsum is simply dummy text',
  },
  {
    id: 3,
    thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
    title: 'Youth Union Incentive App',
    description: 'Lorem Ipsum is simply dummy text',
  },
  {
    id: 4,
    thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
    title: 'DEX Cross-chain',
    description: 'Lorem Ipsum is simply dummy text',
  },
];

export default DAppScreen;
