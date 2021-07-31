import { useNavigation } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import CustomText from '../../../components/Text';
import { formatDexToken, getReserve } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { formatNumberString, isNaN } from '../../../utils/number';
import { truncate } from '../../../utils/string';

export default ({item}: {
  item: Pair
}) => {
  const theme = useContext(ThemeContext)
  const navigation = useNavigation()

  const [rate, setRate] = useState<BigNumber>();

  useEffect(() => {
    (async () => {

      const {reserveIn, reserveOut} = await getReserve(item.t1.hash, item.t2.hash)
      const _tokenFromLiquidity = (new BigNumber(reserveIn)).dividedBy(new BigNumber(10 ** Number(item.t1.decimals))).toFixed()
      const _tokenToLiquidity = (new BigNumber(reserveOut)).dividedBy(new BigNumber(10 ** Number(item.t2.decimals))).toFixed()

      const bnFrom = new BigNumber(_tokenFromLiquidity)
      const bnTo = new BigNumber(_tokenToLiquidity)
      const _rate = bnTo.dividedBy(bnFrom)
      setRate(_rate)
    })()
  }, [])

  return (
    <TouchableOpacity 
      key={item.contract_address} 
      style={{
        backgroundColor: theme.backgroundFocusColor,
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        marginBottom: 12,
      }}
      onPress={() => {
        navigation.navigate('PairDetail', {
          pairItem: item
        })
      }}
    >
      <View style={{flexDirection: 'row', marginRight: 12}}>
        <View style={{width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16}}>
          <Image
            source={{uri: item.t1.logo}}
            style={{width: 32, height: 32}}
          />
        </View>
        <View 
          style={{
            width: 32,
            height: 32,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            marginLeft: -8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffset: {
              width: -6,
              height: 0,
            },
            shadowOpacity: 12,
            shadowRadius: 8,
            elevation: 11,
          }}
        >
          <Image
            source={{uri: item.t2.logo}}
            style={{width: 32, height: 32}}
          />
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'space-between', flexDirection: 'row'}}>
        <View>
          <CustomText 
            style={{
              color: theme.textColor, 
              fontWeight: '500', 
              fontSize: theme.defaultFontSize + 1,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          >
            {formatDexToken(item.t1).symbol} / {formatDexToken(item.t2).symbol}
          </CustomText>
          <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize + 1}}>
            {truncate(formatDexToken(item.t1).name, 15, -1)}, {truncate(formatDexToken(item.t2).name, 15, -1)}
          </CustomText>
        </View>
        <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 1}}>
          {
            rate && !isNaN(rate.toNumber()) ? formatNumberString(rate.toFixed(), 6) : '--'
          }
        </CustomText>
      </View>
    </TouchableOpacity>
  )
}