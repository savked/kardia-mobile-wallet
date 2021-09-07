import { Platform } from "react-native"

export const getSemiBoldStyle = () => {
  return {
    fontWeight: '500' as any,
    fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
  }
}