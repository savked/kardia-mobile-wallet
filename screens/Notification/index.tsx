import React from 'react'
import { View, Text, Image } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { styles } from './style'

const Notification = () => {
    return (
        <View style={{minWidth:'100%', backgroundColor:'gray'}}>
            <FlatList
                numColumns={3}
                data={data}
                renderItem={({ item, index }) => {
                    return (
                        <View style={{minWidth:'40%'}}>
                           <Image
                                style={styles.thumbnail}
                                source={{
                                    uri: 'https://reactnative.dev/img/tiny_logo.png',
                                }}
                            />
                            <Text>{item.name}</Text>
                        </View>
                    )
                }}
                keyExtractor={item => item.name}
                ListEmptyComponent={<Text>No data</Text>}
            />
        </View>
    )
}

const data = [
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        name: 'Sports'
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        name: 'News'
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        name: 'Culture'
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        name: 'A'
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        name: 'B'
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        name: 'C'
    },
    
]

export default Notification
