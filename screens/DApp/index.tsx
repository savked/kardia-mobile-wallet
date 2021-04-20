import React from 'react';
import {View, FlatList, Image} from 'react-native';
import CustomText from '../../components/Text';
import {styles} from './style';

const DAppScreen = () => {
  return (
    <View style={styles.container}>
      <CustomText  style={styles.title}>Explorer Kardia's ecosystem</CustomText>
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
                <CustomText>{item.title}</CustomText>
                {/* <CustomText>{item.description}</CustomText> */}
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item.title}
        ListEmptyComponent={<CustomText>No data</CustomText>}
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
