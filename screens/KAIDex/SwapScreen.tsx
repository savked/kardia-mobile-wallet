import React, { useContext, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
// import { useRecoilValue } from 'recoil';
// import { krc20ListAtom } from '../../atoms/krc20';
import Button from '../../components/Button';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { ThemeContext } from '../../ThemeContext';

export default ({triggerSelectPair, tokenFrom, tokenTo}: {
  triggerSelectPair: () => void;
  tokenFrom?: PairToken;
  tokenTo?: PairToken;
}) => {
  const theme = useContext(ThemeContext);
  // const krc20List = useRecoilValue(krc20ListAtom)

  const [amountFrom, setAmountFrom] = useState('0')
  // const [tokenFrom, setTokenFrom] = useState<KRC20>(krc20List[0])

  const [amountTo, setAmountTo] = useState('0')
  // const [tokenTo, setTokenTo] = useState<KRC20>(krc20List[1])

  return (
    <View style={{width: '100%', alignItems: 'center', backgroundColor: theme.backgroundFocusColor, paddingHorizontal: 16, paddingVertical: 24, borderRadius: 12}}>
      <TouchableOpacity 
        style={{backgroundColor: theme.backgroundColor, padding: 16, width: '100%', borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center'}}
        onPress={triggerSelectPair}
      >
        <View style={{flexDirection: 'row', marginRight: 12}}>
          {
            tokenFrom && (
              <Image
                source={{uri: tokenFrom.logo}}
                style={{width: 32, height: 32}}
              />
            )
          }
          {
            tokenTo && (
              <Image
                source={{uri: tokenTo.logo}}
                style={{width: 32, height: 32, marginLeft: -8}}
              />
            )
          }
        </View>
        <View style={{flex: 1}}>
          {tokenFrom && tokenTo && <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 4}}>{tokenFrom.symbol} / {tokenTo.symbol}</CustomText>}
          <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>Click to select pair</CustomText>
        </View>
        <Image
          source={require('../../assets/icon/chevron-right.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
      {tokenFrom && (
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
            From
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountFrom}
              onChangeText={setAmountFrom}
              containerStyle={{width: '100%'}}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
              }}
            />
            <View style={{position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: 74}}>
              {
                tokenFrom && (
                  <>
                    <Image
                      source={{uri: tokenFrom.logo}}
                      style={{width: 20, height: 20, marginRight: 8}}
                    />
                    <CustomText style={{color: theme.textColor}}>{tokenFrom.symbol}</CustomText>
                  </>
                )
              }
            </View>
          </View>
          <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
            Balance:{' '}
            <CustomText style={{color: theme.textColor}}>100</CustomText>
          </CustomText>
        </View>
      )}
      {tokenTo && (
        <View style={{width: '100%', marginTop: 12}}>
          <CustomText 
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 1,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
              fontWeight: '500',
              marginBottom: 6
            }}
          >
            To
          </CustomText>
          <View style={{flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <CustomTextInput
              value={amountTo}
              onChangeText={setAmountTo}
              containerStyle={{width: '100%'}}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
              }}
            />
            <View style={{position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: 74}}>
              {
                tokenTo && (
                  <>
                    <Image
                      source={{uri: tokenTo.logo}}
                      style={{width: 20, height: 20, marginRight: 8}}
                    />
                    <CustomText style={{color: theme.textColor}}>{tokenTo.symbol}</CustomText>
                  </>
                )
              }
            </View>
          </View>
          {tokenTo && (
            <CustomText style={{marginTop: 4, color: theme.mutedTextColor, lineHeight: 20}}>
              Balance:{' '}
              <CustomText style={{color: theme.textColor}}>100</CustomText>
            </CustomText>
          )}
        </View>
      )}
      {
        tokenFrom && tokenTo && (
          <View style={{marginTop: 12}}>
            <CustomText style={{color: theme.textColor}}>
              1{' '}
              <CustomText style={{color: theme.mutedTextColor}}>{tokenFrom.symbol}</CustomText>{' '}={' '}
              <CustomText style={{color: theme.textColor}}>~ 1,234 </CustomText>
              <CustomText style={{color: theme.mutedTextColor}}>{tokenTo.symbol}</CustomText>
            </CustomText>
          </View>
        )
      }
      {
        tokenFrom && tokenTo && (
          <Button
            title="Swap"
            onPress={() => {}}
            style={{marginTop: 32}}
            textStyle={{
              fontSize: theme.defaultFontSize + 3,
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        )
      }
    </View>
  )
}