import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useState } from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { favoritePairsAtom } from '../../../atoms/favoritePairs';
import { languageAtom } from '../../../atoms/language';
import { statusBarColorAtom } from '../../../atoms/statusBar';
import { ThemeContext } from '../../../ThemeContext';
import DEXHeader from '../../common/DEXHeader';
import FavoriteSection from './FavoriteSection';
import MarketScreen from './MarketScreen'
import PairListSection from './PairListSection';

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const {params} = useRoute();
  const [showMenu, setShowMenu] = useState(true);
  const favoritePair = useRecoilValue(favoritePairsAtom)
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundStrongColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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
          <PairListSection />
          {/* <View
            style={{paddingHorizontal: 20, flex: 1}}
          >
            <MarketScreen
              toggleMenu={() => {
                setShowMenu(!showMenu)
              }}
              params={params}
            />
          </View> */}
        </View>
      {/* </TouchableWithoutFeedback> */}
    </View>
  )
}