import { useQuery } from '@apollo/client'
import { format } from 'date-fns'
import React, { useContext } from 'react'
import { Platform, View } from 'react-native'
import { useRecoilValue } from 'recoil'
import { languageAtom } from '../../../atoms/language'
import Button from '../../../components/Button'
import CustomText from '../../../components/Text'
import { SMALL_VALUE } from '../../../config'
import { formatDexToken } from '../../../services/dex'
import { GET_MARKET_HISTORY } from '../../../services/dex/queries'
import { ThemeContext } from '../../../ThemeContext'
import { getOrderAmount, getOrderPrice, isBuy } from '../../../utils/dex'
import { getLanguageString } from '../../../utils/lang'
import { formatNumberString, isTooSmall } from '../../../utils/number'

export default ({pairItem}: {
  pairItem: Pair
}) => {
  const language = useRecoilValue(languageAtom)
  const theme = useContext(ThemeContext)
  const {data, loading, error, refetch} = useQuery(GET_MARKET_HISTORY(pairItem.contract_address), {
    pollInterval: 10000,
  })

  const parsedList = () => {
    if (!data || !data.swaps || error) return []
    return data.swaps.map((item: any) => {
      const newItem = JSON.parse(JSON.stringify(item))
      if (pairItem.invert) {
        const tempAmountIn = newItem.amount0In
        newItem.amount0In = newItem.amount1In
        newItem.amount1In = tempAmountIn

        const tempAmountOut = newItem.amount0Out
        newItem.amount0Out = newItem.amount1Out
        newItem.amount1Out = tempAmountOut
      }
      return {
        ...newItem,
        date: new Date(Number(newItem.timestamp) * 1000)
      }
    })
  }

  const renderError = () => {
    if (!error) return null
    if (loading) return null
    console.log(error)
    return (
      <Button
        type="outline"
        title="Retry"
        onPress={refetch}
      />
    )
  }

  return (
    <View>
      <CustomText
        style={{
          color: theme.textColor,
          textAlign: 'center',
          marginVertical: 12,
          fontSize: theme.defaultFontSize + 8,
          fontWeight: 'bold'
        }}
      >
        Market History
      </CustomText>
      {/* {
        renderError()
      } */}
      <View style={{width: '100%'}}>
        <View style={{flex: 1, paddingHorizontal: 20}}>
          <View style={{flexDirection: 'row', width: '100%', marginBottom: 16, justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <CustomText 
                style={{
                  color: 'rgba(252, 252, 252, 0.26)',
                  fontWeight: '500',
                  fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                }}
              >
                {getLanguageString(language, 'TIME')}
              </CustomText>
            </View>
            <View style={{flex: 1, alignItems: 'center'}}>
              <CustomText 
                style={{
                  color: 'rgba(252, 252, 252, 0.26)',
                  fontWeight: '500',
                  fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                }}
              >
                {getLanguageString(language, 'PRICE')}
              </CustomText>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <CustomText 
                style={{
                  color: 'rgba(252, 252, 252, 0.26)',
                  fontWeight: '500',
                  fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                }}
              >
                {getLanguageString(language, 'SIZE')} ({formatDexToken(pairItem.t1).symbol})
              </CustomText>
            </View>
          </View>
        </View>
        <View style={{flex: 1, paddingHorizontal: 20}}>
          {
            parsedList().map((order: any) => {
              return (
                <View key={order.id} style={{flexDirection: 'row', width: '100%', marginBottom: 16, justifyContent: 'space-between', alignItems: 'center'}}>
                  <View style={{flex: 1, alignItems: 'flex-start'}}>
                    <CustomText 
                      style={{
                        color: theme.textColor,
                        fontWeight: '500',
                        fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                      }}
                    >
                      {format(order.date, 'dd/MM HH:mm')}
                    </CustomText>
                  </View>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <CustomText 
                      style={{
                        color: isBuy(order) ? 'rgba(93, 215, 91, 1)' : 'rgba(255, 66, 67, 1)',
                        fontWeight: '500',
                        fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                      }}
                    >
                      {
                        isTooSmall(getOrderPrice(order).toFixed()) ? 
                        `< ${SMALL_VALUE}` :
                        formatNumberString(getOrderPrice(order).toFixed(), 6)
                      }
                    </CustomText>
                  </View>
                  <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <CustomText 
                      style={{
                        color: 'rgba(252, 252, 252, 0.54)',
                        fontWeight: '500',
                        fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                      }}
                    >
                      {
                        formatNumberString(getOrderAmount(order), 4)
                      }
                    </CustomText>
                  </View>
                </View>
              )
            })
          }
        </View>
      </View>
    </View>
  )
}