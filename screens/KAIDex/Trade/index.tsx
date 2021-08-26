import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useState } from 'react'
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { favoritePairsAtom } from '../../../atoms/favoritePairs';
import { statusBarColorAtom } from '../../../atoms/statusBar';
import { ThemeContext } from '../../../ThemeContext';
import DEXHeader from '../../common/DEXHeader';
import FavoriteSection from './FavoriteSection';
import PairListSection from './PairListSection';
import SelectingPair from './SelectingPair';

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  const [showMenu, setShowMenu] = useState(true);
  const favoritePair = useRecoilValue(favoritePairsAtom)
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const insets = useSafeAreaInsets();

  const [searchingPair, setSearchingPair] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundStrongColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  if (searchingPair) {
    return (
      <SelectingPair
        onSelect={(pairItem: Pair) => {
          setSearchingPair(false)
          navigation.navigate('PairDetail', {
            pairItem: pairItem
          })
        }}
        goBack={() => {
          setSearchingPair(false)
        }}
      />
    )
  }

  return (
    <View 
      style={{
        backgroundColor: theme.backgroundColor, 
        flex: 1,
        // paddingTop: showMenu ? 28 + insets.top : 0 // Old DEX Tab
      }}
    >
      {/* <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}> */}
        <View style={{flex: 1}}>
          {
            showMenu && (
              // <View
              //   style={{paddingHorizontal: 20}}
              // >
                <DEXHeader
                  type="TRADE"
                />
              // </View>
            )
          }
          {favoritePair.length > 0 && <FavoriteSection />}
          <PairListSection showSearching={() => setSearchingPair(true)} />
        </View>
      {/* </TouchableWithoutFeedback> */}
    </View>
  )
}