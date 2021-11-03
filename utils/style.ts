import { Platform, TextStyle } from "react-native"

export const getSemiBoldStyle = () => {
  const boldStyle: TextStyle = {
    fontWeight: '500' as any,
  }
  if (Platform.OS === 'android') {
    boldStyle.fontFamily = 'WorkSans-SemiBold'
  }
  return boldStyle
}