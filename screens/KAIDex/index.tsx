import React, { useContext, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilValue } from 'recoil';
import { krc20ListAtom } from '../../atoms/krc20';
import Divider from '../../components/Divider';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { ThemeContext } from '../../ThemeContext';

export default () => {
  const theme = useContext(ThemeContext);

  const [type, setType] = useState('SWAP');
  const [amountFrom, setAmountFrom] = useState('0')

  const krc20List = useRecoilValue(krc20ListAtom)

  return (
    <SafeAreaView style={{backgroundColor: theme.backgroundColor, flex: 1, paddingHorizontal: 20}}>
      <View style={{width: '100%', alignItems: 'center'}}>
        <View style={{borderRadius: 12, borderColor: 'rgba(96, 99, 108, 1)', borderWidth: 1.5, padding: 4, flexDirection: 'row', marginBottom: 32}}>
          <TouchableOpacity 
            style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'SWAP' ? theme.backgroundFocusColor : 'transparent'}}
            onPress={() => setType('SWAP')}
          >
            <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'SWAP' ? 'bold' : undefined}}>Swap</CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, width: 116, height: 36, backgroundColor: type === 'EX' ? theme.backgroundFocusColor : 'transparent'}}
            onPress={() => setType('EX')}
          >
            <CustomText style={{color: theme.textColor, textAlign: 'center', fontWeight: type === 'EX' ? 'bold' : undefined}}>Exchange</CustomText>
          </TouchableOpacity>
        </View>
        <View style={{width: '100%'}}>
          <CustomText 
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 1,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
              fontWeight: '500',
              marginBottom: 6
            }}
          >
            Swap from
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountFrom}
              onChangeText={setAmountFrom}
              containerStyle={{width: '70%'}}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
              }}
            />
            <TouchableOpacity style={{width: '25%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
              <Image
                source={{uri: krc20List[0].avatar}}
                style={{width: 32, height: 32, marginRight: 8}}
              />
              <CustomText style={{color: theme.textColor}}>BNB</CustomText>
              <Image
                source={require('../../assets/icon/chevron-right.png')}
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
          </View>
          <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
            Balance:{' '}
            <CustomText style={{color: theme.textColor}}>100</CustomText>
          </CustomText>
        </View>
        <View style={{width: '100%', justifyContent: 'center'}}>
          <Divider style={{width: '100%', backgroundColor: '#F0F1F2'}} />
          <TouchableOpacity 
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: 'rgba(51, 96, 255, 1)',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: 20 + 29.5 + 8,
            }}
          >
            <Image
              source={require('../../assets/icon/swap_dark.png')}
              style={{
                width: 15, height: 15
              }}
            />
          </TouchableOpacity>
        </View>
        <View style={{width: '100%'}}>
          <CustomText 
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 1,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
              fontWeight: '500',
              marginBottom: 6
            }}
          >
            Swap to
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountFrom}
              onChangeText={setAmountFrom}
              containerStyle={{width: '70%'}}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
              }}
            />
            <TouchableOpacity style={{width: '25%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
              <Image
                source={{uri: krc20List[0].avatar}}
                style={{width: 32, height: 32, marginRight: 8}}
              />
              <CustomText style={{color: theme.textColor}}>BNB</CustomText>
              <Image
                source={require('../../assets/icon/chevron-right.png')}
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
          </View>
          <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
            Balance:{' '}
            <CustomText style={{color: theme.textColor}}>100</CustomText>
          </CustomText>
        </View>
      </View>
    </SafeAreaView>
  )
};