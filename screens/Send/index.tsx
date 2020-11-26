import React from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles } from './style';
import Button from '../../components/Button'

const SendTx = () => {
    const [value, onChangeText] = React.useState('');
    function send() {
        console.log('send');
    }

    function max() {
        console.log('max')
    }

    return (
        <View style={styles.container}>
            <View style={{ marginBottom: 10 }}>
                <Text style={styles.headline}>Send to address</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TextInput
                        style={styles.input}
                        onChangeText={text => onChangeText(text)}
                        value={value}
                    />
                    <TouchableOpacity onPress={max}>
                        <Icon name="qrcode" size={25} color={"black"} style={{ position: 'absolute', right: 15, top: 8 }} />
                    </TouchableOpacity>
                </View>

            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={styles.headline}>Amount</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TextInput
                        style={styles.input}
                        onChangeText={text => onChangeText(text)}
                        value={value}
                    />
                    <TouchableOpacity onPress={max}>
                        <Text style={{ position: 'absolute', right: 10, top: 9 }}>MAX</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ marginBottom: 20 }}>
                <Text style={styles.title}>Recap of your transaction</Text>
                <View style={styles.wrap}>
                    <View style={styles.left}>
                        <Text >Gas Price</Text>
                        <Text>300 GWEI</Text>
                    </View>
                    <View style={styles.right}>
                        <Text >Gas Limit</Text>
                        <Text>21.000 WEI</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.title}>Transaction Speed</Text>
            <ListCard />

            <Text style={{ marginTop: 20, fontStyle: 'italic' }}>
                * Accelerating a transaction by using a higher gas price increases its chances of getting processed by the network faster, but it is not always guaranteed.
            </Text>
            <Button
                title="SEND"
                onPress={send}
                iconName="paper-plane"
                style={{ backgroundColor: '#00487C', marginTop: 20 }}
            />
        </View>
    )
}

const data = [
    {
        title: 'Slow',
        time: '~30 sec'
    },
    {
        title: 'Average',
        time: '~20 sec',
    },
    {
        title: 'Fast',
        time: '~10 sec',
    }
]


const ListCard = () => {
    return (
        <FlatList
            contentContainerStyle={styles.listCard}
            data={data}
            renderItem={({ item, index }) => {
                return (
                    <View style={{
                        backgroundColor: 'white', padding: 20, borderRadius: 8,
                    }}>
                        <Text style={{ textAlign: 'center' }}>{item.title}</Text>
                        <Text>{item.time}</Text>
                    </View>
                )
            }}
            keyExtractor={item => item.title}
            ListEmptyComponent={<Text>No data</Text>}
        />
    )
}
export default SendTx
