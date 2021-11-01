import { useIsFocused, useNavigation } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import CustomText from '../../../components/Text';
import { formatDexToken, getReserve } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { formatNumberString, isNaN } from '../../../utils/number';

export default ({pairItem, isLast, isFirst}: {
  pairItem: Pair;
  isLast: boolean;
  isFirst: boolean;
}) => {
  const theme = useContext(ThemeContext)
  const navigation = useNavigation()

  const isFocused = useIsFocused();

  const [rate, setRate] = useState<BigNumber>();
  const [intervalID, setIntervalID] = useState<NodeJS.Timer>()

  const fetchRate = async () => {
    const {reserveIn, reserveOut} = await getReserve(pairItem.t1.hash, pairItem.t2.hash)
    const _tokenFromLiquidity = (new BigNumber(reserveIn)).dividedBy(new BigNumber(10 ** Number(pairItem.t1.decimals))).toFixed()
    const _tokenToLiquidity = (new BigNumber(reserveOut)).dividedBy(new BigNumber(10 ** Number(pairItem.t2.decimals))).toFixed()

    const bnFrom = new BigNumber(_tokenFromLiquidity)
    const bnTo = new BigNumber(_tokenToLiquidity)
    const _rate = bnTo.dividedBy(bnFrom)
    setRate(_rate)
  }

  useEffect(() => {
    (async () => {
      if (!isFocused) {
        if (intervalID) {
          clearInterval(intervalID)
        }
        return
      }

      await fetchRate()

      setIntervalID(
        setInterval(() => {
          fetchRate()
        }, 5000)
      ) 

      return () => {
        intervalID && clearInterval(intervalID)
      }

    })()
  }, [pairItem, isFocused])

  return (
    <TouchableOpacity 
      style={{
        marginLeft: isFirst ? 20 : 16,
        marginRight: isLast ? 20 : 0,
        backgroundColor: theme.backgroundFocusColor,
        padding: 16,
        borderRadius: 12
      }}
      onPress={() => {
        navigation.navigate('PairDetail', {
          pairItem
        })
      }}
    >
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', marginRight: 12}}>
          <View style={{width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16}}>
            <Image
              source={{uri: pairItem.t1.logo}}
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
              source={{uri: pairItem.t2.logo}}
              style={{width: 32, height: 32}}
            />
          </View>
        </View>
        <CustomText
          style={{
            color: theme.textColor,
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        >
          {formatDexToken(pairItem.t1).symbol} / {formatDexToken(pairItem.t2).symbol}
        </CustomText>
      </View>
      <View style={{marginTop: 8}}>
        <CustomText style={{color: theme.textColor, fontWeight: 'bold', fontSize: theme.defaultFontSize + 8}}>
          {
            rate && !isNaN(rate.toNumber()) ? formatNumberString(rate.toFixed(), 6) : '--'
          }
        </CustomText>
      </View>
    </TouchableOpacity>
  )
}