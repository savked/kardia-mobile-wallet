import React from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import List from '../../components/List';
import { truncate } from '../../utils/string';

const txList = [
    {
        label: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda559',
        value: '0xbe1cdf260866f7ae710ad1963203ab1c9bcc9e0e86798c229d7efdbaaecda559'
    },
    {
        label: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a73',
        value: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a73'
    },
    {
        label: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125646',
        value: '0x1dacfc9a02136e5b42abcb96dd6dd2cfb8e05548650976ccce98a1e292125646'
    }
]

const TransactionScreen = () => {

    const onSelect = (itemIndex: number) => {
        console.log(itemIndex)
        Alert.alert(`${itemIndex}`)
    }

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{flex: 1}}>
                <Text>
                    Transaction screen
                </Text>
            </View>
            <View style={{flex: 1}}>
                <List 
                    items={txList} 
                    // render={(item, index) => {
                    //     return <TouchableOpacity onPress={() => onSelect(index)}><Text>{truncate(item.label, 10, 15)}</Text></TouchableOpacity>
                    // }}
                    onSelect={(itemIndex) => {
                        console.log(itemIndex)
                        Alert.alert(`${itemIndex}`)
                    }}
                />
            </View>
        </SafeAreaView>
    )
}

export default TransactionScreen