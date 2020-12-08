/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {styles} from './style';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import {useNavigation} from '@react-navigation/native';
import {truncate} from '../../utils/string';
import {format, getDigit, isNumber} from '../../utils/number';
import {ThemeContext} from '../../App';

const MAX_AMOUNT = 5000000000;

const CreateTxScreen = () => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('0');
  const [showQRModal, setShowQRModal] = useState(false);

  const theme = useContext(ThemeContext);
  const navigation = useNavigation();

  function send() {
    console.log('send');
  }

  const showQRScanner = () => {
    console.log('here');
    setShowQRModal(true);
  };

  if (showQRModal) {
    return (
      <QRCodeScanner
        onRead={(e) => {
          setAddress(e.data);
          setShowQRModal(false);
        }}
        topContent={<Text style={styles.centerText}>Scan address QR code</Text>}
        bottomContent={
          <Button
            style={{marginTop: 50}}
            title="Cancel"
            onPress={() => setShowQRModal(false)}
          />
        }
      />
    );
  }

  return (
    <View
      style={[styles.container, {backgroundColor: theme.backgroundFocusColor}]}>
      <View style={{marginBottom: 10}}>
        <TextInput
          onChangeText={setAddress}
          value={truncate(address, 10, 20)}
          iconName="qrcode"
          onIconPress={showQRScanner}
          headline="Send to address"
        />
      </View>

      <View style={{marginBottom: 20}}>
        <TextInput
          onChangeText={(newAmount) => {
            const digitOnly = getDigit(newAmount);
            if (Number(digitOnly) > MAX_AMOUNT) {
              return;
            }
            if (digitOnly === '') {
              setAmount('0');
              return;
            }
            isNumber(digitOnly) && setAmount(digitOnly);
          }}
          value={format(Number(amount))}
          headline="Amount (maximum: 5,000,000,000)"
        />
      </View>

      <View style={{marginBottom: 20}}>
        <Text style={[styles.title, {color: theme.textColor}]}>
          Recap of your transaction
        </Text>
        <View style={styles.wrap}>
          <View>
            <Text style={[{color: theme.textColor}]}>Gas Price</Text>
            <Text style={[{color: theme.textColor}]}>300 GWEI</Text>
          </View>
          <View>
            <Text style={[{color: theme.textColor}]}>Gas Limit</Text>
            <Text style={[{color: theme.textColor}]}>21.000 WEI</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.title, {color: theme.textColor}]}>
        Transaction Speed
      </Text>
      <View>
        <ListCard />
      </View>

      <Text
        style={[
          {marginTop: 20, fontStyle: 'italic'},
          {color: theme.textColor},
        ]}>
        * Accelerating a transaction by using a higher gas price increases its{' '}
        chances of getting processed by the network faster, but it is not always
        guaranteed.
      </Text>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 20,
          justifyContent: 'space-around',
        }}>
        <Button
          title="SEND"
          onPress={send}
          iconName="paper-plane"
          type="primary"
          size="large"
        />
        <Button
          title="CANCEL"
          onPress={() => navigation.goBack()}
          type="outline"
          size="large"
        />
      </View>
    </View>
  );
};

const data = [
  {
    title: 'Slow',
    time: '~30 sec',
  },
  {
    title: 'Average',
    time: '~20 sec',
  },
  {
    title: 'Fast',
    time: '~10 sec',
  },
];

const ListCard = () => {
  return (
    <FlatList
      contentContainerStyle={styles.listCard}
      data={data}
      renderItem={({item}) => {
        return (
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 8,
            }}>
            <Text style={{textAlign: 'center'}}>{item.title}</Text>
            <Text>{item.time}</Text>
          </View>
        );
      }}
      keyExtractor={(item) => item.title}
      ListEmptyComponent={<Text>No data</Text>}
    />
  );
};
export default CreateTxScreen;
