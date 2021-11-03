import { Dimensions } from 'react-native'

export const isSmall = () => {
  const {width} = Dimensions.get('window')

  return width < 1080
}