import { useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSetRecoilState } from 'recoil'
import { showTabBarAtom } from '../../atoms/showTabBar'
import { statusBarColorAtom } from '../../atoms/statusBar'
import CustomText from '../../components/Text'
import { ThemeContext } from '../../ThemeContext'
import { getSemiBoldStyle } from '../../utils/style'

export default () => {
  const theme = useContext(ThemeContext)
  const {params}: any = useRoute()

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!params) return;

  }, [params])

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
      }}
    >
      <CustomText
        style={[{
          color: theme.textColor,
          fontSize: theme.defaultFontSize + 20
        }, getSemiBoldStyle()]}
      >
        Sign transaction
      </CustomText>
    </SafeAreaView>
  )
}