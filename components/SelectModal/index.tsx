import React, { useContext, useState } from 'react'
import { TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useRecoilValue } from 'recoil'
import { languageAtom } from '../../atoms/language'
import { ThemeContext } from '../../ThemeContext'
import { getLanguageString } from '../../utils/lang'
import CustomText from '../Text'
import ItemListModal from './ItemListModal'
import { styles } from './style'

export default ({
  value,
  headline = '',
  headlineStyle = [],
  containerStyle,
  renderItem,
  renderSelected,
  item,
  onSelect,
  message = '',
  searchPlaceHolder = ''
}: SelectModalProps & {
  headlineStyle?: TextStyle | TextStyle[]
  containerStyle?: ViewStyle
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const finalHeadlineStyle = 
    Array.isArray(headlineStyle) ? 
    [{color: theme.textColor, fontSize: theme.defaultFontSize + 1, ...styles.headline}, ...headlineStyle] : 
    [styles.headline, {color: theme.textColor, fontSize: theme.defaultFontSize + 1}, headlineStyle]

  const [showSelectItemModal, setShowSelectItemModal] = useState(false)

  return (
    <View
      style={containerStyle}
    >
      <ItemListModal
        visible={showSelectItemModal}
        onClose={() => setShowSelectItemModal(false)}
        itemList={item}
        renderItem={renderItem}
        onSelect={(item) => {
          onSelect(item)
          setShowSelectItemModal(false)
        }}
        searchPlaceHolder={searchPlaceHolder}
      />
      {
        headline !== '' &&
        <CustomText
          style={finalHeadlineStyle}
        >
          {headline}
        </CustomText>
      }
      <TouchableOpacity
        style={styles.selectContainer}
        onPress={() => setShowSelectItemModal(true)}
      >
        <View>
          {
            value ? renderSelected(value) : <CustomText>{' '}</CustomText>
          }
        </View>
        <View>
          <CustomText style={{color: theme.mutedTextColor}}>
            {getLanguageString(language, 'SELECT')}
          </CustomText>
        </View>
      </TouchableOpacity>
      {
        message !== '' &&
        <CustomText style={styles.errorMessage}>{message}</CustomText>
      }
    </View>
  )
}