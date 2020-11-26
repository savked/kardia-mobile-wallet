import React from 'react';
import { Text, View, FlatList, Image } from 'react-native';
import { styles } from './style'

const DAppScreen = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <FlatList
                data={data}
                renderItem={({ item, index }) => {
                    return (
                        <View style={{ flexDirection: 'row', padding: 20, backgroundColor: 'white', marginBottom: 10, marginTop: 10, borderRadius: 12, minWidth: '100%' }}>
                            <Image
                                style={styles.thumbnail}
                                source={{
                                    uri: 'https://reactnative.dev/img/tiny_logo.png',
                                }}
                            />
                            <View>
                                <Text>{item.title}</Text>
                                <Text>{item.description}</Text>
                            </View>
                        </View>
                    )
                }}
                keyExtractor={item => item.title}
                ListEmptyComponent={<Text>No data</Text>}
            />
        </View>
    )
}

const data = [
    {
        id: 1,
        thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'KAI Membership',
        description: 'Lorem Ipsum is simply dummy text'
    },
    {
        id: 2,
        thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'KAIStarter',
        description: 'Lorem Ipsum is simply dummy text'
    },
    {
        id: 3,
        thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'Youth Union Incentive App',
        description: 'Lorem Ipsum is simply dummy text'
    },
    {
        id: 4,
        thumbnail: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'DEX Cross-chain',
        description: 'Lorem Ipsum is simply dummy text'
    }
]

export default DAppScreen