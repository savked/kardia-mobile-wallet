import React from 'react'
import { View, Text, Image } from 'react-native'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { styles } from './style'

const Notification = () => {
    function viewDetail() {
        console.log('view detail');
    }

    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    function dateDiffInDays(earlyDate: Date, laterDate: Date) {
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(earlyDate.getFullYear(), earlyDate.getMonth(), earlyDate.getDate());
        const utc2 = Date.UTC(laterDate.getFullYear(), laterDate.getMonth(), laterDate.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    function convertSecondsToDate(seconds: number){
        const _date = new Date(seconds * 1000);
        const hours = _date.getHours() < 10 ? `0${_date.getHours()}` : _date.getHours();
        const minutes = _date.getMinutes() < 10 ? `0${_date.getMinutes()}` : _date.getMinutes();
        return <Text>{hours + ':' + minutes }</Text>
    }

    return (
        <View style={{ minWidth: '100%', backgroundColor: '#f8f9fa' }}>
            <Text style={styles.headline}>Today</Text>
            <FlatList
                data={data}
                renderItem={({ item, index }) => {
                    return (
                        dateDiffInDays(new Date(item.date * 1000), new Date()) == 0 && <TouchableOpacity onPress={viewDetail}>
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
                                {convertSecondsToDate(item.date)}
                            </View>
                        </View>
                    </TouchableOpacity>
                    )
                }}
                keyExtractor={item => item.title}
                ListEmptyComponent={<Text>No data</Text>}
            />

            <Text style={styles.headline}>Yesterday</Text>
            <FlatList
                data={data}
                renderItem={({ item, index }) => {
                    return (
                        dateDiffInDays(new Date(item.date * 1000), new Date()) !== 0 && <TouchableOpacity onPress={viewDetail}>
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
                                {convertSecondsToDate(item.date)}
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
        description: "Why I quit my job in order to pursue News",
        date: 1606876708,
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'News in 3 easy steps',
        description: "12 things you didn't know about News",
        date: 1606876708,
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'How News are changing my life',
        description: "Is pizza really better than News?",
        date: 1606876708,
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'Why News are more important than the air you breathe',
        description: "5 important lessons I learned about News",
        date: 1606876708,
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: 'How to use News to solve problems',
        description: "How much is News worth to you?",
        date: 1506876708,
    },
    {
        url: 'https://reactnative.dev/img/tiny_logo.png',
        title: '3 different ways to get your own News',
        description: "How News are changing my life",
        date: 1506876708,
    }

]

export default Notification
