import React from 'react'
import { View, Text, Image } from 'react-native'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { styles } from './style'

const Notification = () => {
    function viewDetail(){
        console.log('view detail');
    }

    return (
        <View style={{ minWidth: '100%', backgroundColor: '#f8f9fa' }}>
            <FlatList
                data={data}
                renderItem={ ({item, index})  => {
                    return (
                        <TouchableOpacity onPress={viewDetail}>
                            <View style={styles.row}>
                                <View style={styles.left}>
                                    <Image
                                        style={styles.thumbnail}
                                        source={{
                                            uri: 'https://reactnative.dev/img/tiny_logo.png',
                                        }}
                                    />
                                </View>
                                <View style={styles.right}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.description}>{item.description}</Text>
                                    <Text style={styles.time}>12:00 PM</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
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
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'The News that wins customers',
        description: "Why I quit my job in order to pursue News"
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'News in 3 easy steps',
        description: "12 things you didn't know about News"
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'How News are changing my life',
        description: "Is pizza really better than News?"
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'Why News are more important than the air you breathe',
        description: "5 important lessons I learned about News"
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'How to use News to solve problems',
        description: "How much is News worth to you?"
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: '3 different ways to get your own News',
        description: "How News are changing my life"
    },

]

export default Notification
