import React, { useContext } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../ThemeContext'

export default () => {
  const theme = useContext(ThemeContext)
  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.backgroundColor,
        flex: 1
      }}
    >

    </SafeAreaView>
  )
}