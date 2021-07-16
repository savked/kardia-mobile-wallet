import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useState } from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import { ThemeContext } from '../../../ThemeContext';
import DEXHeader from '../../common/DEXHeader';
import MarketScreen from './MarketScreen'

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const {params} = useRoute();
  const [showMenu, setShowMenu] = useState(true);

  const insets = useSafeAreaInsets();

  return (
    <View style={{backgroundColor: theme.backgroundColor, flex: 1, paddingHorizontal: 20, paddingTop: showMenu ? 28 + insets.top : 0}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{flex: 1}}>
          {
            showMenu && (
              <DEXHeader
                type="TRADE"
              />
            )
          }
          <MarketScreen
            toggleMenu={() => {
              setShowMenu(!showMenu)
            }}
            params={params}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}