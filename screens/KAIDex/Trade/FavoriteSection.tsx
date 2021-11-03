import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { favoritePairsAtom } from '../../../atoms/favoritePairs';
import CustomText from '../../../components/Text';
import { getPairs } from '../../../services/dex';
import { ThemeContext } from '../../../ThemeContext';
import { pairMapper } from '../../../utils/dex';
import FavoriteItem from './FavoriteItem';

export default () => {
  const theme = useContext(ThemeContext)
  const favoritePair = useRecoilValue(favoritePairsAtom)

  const [pairs, setPairs] = useState<Pair[]>([])

  const fetchPairData = async () => {
    try {
      const rs = await getPairs()
      if (rs) {
        const parsedPairs = pairMapper(rs.pairs)
        setPairs(parsedPairs)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchPairData()
  }, [])

  return (
    <View>
      <CustomText
        style={{
          color: theme.textColor,
          fontWeight: 'bold',
          fontSize: theme.defaultFontSize + 6,
          paddingHorizontal: 20
        }}
      >
        Favorites
      </CustomText>
      <View style={{
        marginVertical: 8
      }}>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          {favoritePair.map((pairAddress, index) => {
            const pairItem = pairs.find((item) => item.contract_address === pairAddress)
            if (!pairItem) return null
            return (
              <FavoriteItem 
                key={`fav-pair-${index}`}
                pairItem={pairItem} 
                isFirst={index === 0} 
                isLast={index === favoritePair.length - 1} 
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  )
}