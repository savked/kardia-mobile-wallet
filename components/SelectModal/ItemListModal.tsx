import React, { useContext, useState } from 'react'
import { Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import { useRecoilValue } from 'recoil'
import { languageAtom } from '../../atoms/language'
import useIsKeyboardShown from '../../hooks/isKeyboardShown'
import { ThemeContext } from '../../ThemeContext'
import { getLanguageString } from '../../utils/lang'
import Button from '../Button'
import List from '../List'
import CustomModal from '../Modal'
import CustomTextInput from '../TextInput'

export default ({visible, onClose, itemList, renderItem, onSelect}: {
  visible: boolean;
  onClose: () => void;
  itemList: Record<string, any>[];
  renderItem: (item: Record<string, any>, index: number) => any;
  onSelect: (item: Record<string, any>) => void
}) => {
  const language = useRecoilValue(languageAtom)
  const theme = useContext(ThemeContext)

  const keyboardShown = useIsKeyboardShown();
  const [searchQuery, setSearchQuery] = useState('')

  const getContentStyle: () => ViewStyle = () => {
    if (Platform.OS === 'android') {
      return {
        backgroundColor: theme.backgroundFocusColor,
        height: 520,
        padding: 0,
        paddingTop: 32,
        marginTop: keyboardShown ? 20 : 0,
        marginBottom: keyboardShown ? -20 : 0,
        paddingBottom: 52,
      }
    }
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 520,
      padding: 0,
      paddingTop: 32,
      paddingBottom: 52,
      marginTop: keyboardShown ? -150 : 0,
      marginBottom: keyboardShown ? 150 : 0,
    }
  }

  const filterList = () => {
    if (!searchQuery) return itemList
    return itemList.filter((item) => {
      if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) return true
      if (item.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return true
      return false
    })
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={getContentStyle()}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{width: '100%', flex: 1}}>
          <View style={{width: '100%', flex: 1}}>
            <CustomTextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 27,
              }}
              inputStyle={{
                backgroundColor: theme.inputBackgroundColor,
                color: theme.textColor
              }}
              placeholder={getLanguageString(language, 'SEARCH_FOR_TOKEN')}
              placeholderTextColor={theme.mutedTextColor}
            />
            <List
              listStyle={{
                width: '100%',
                flex: 1
              }}
              items={filterList()}
              keyExtractor={(item: KRC20) => item.symbol}
              render={(item, index) => {
                const showBorder = index !== filterList().length - 1
                return (
                  <TouchableOpacity
                    key={`item-${index}`}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      backgroundColor: 'transparent',
                      width: '100%',
                      borderBottomColor: showBorder ? '#60636C' : 'transparent',
                      borderBottomWidth: 1
                    }}
                    onPress={() => onSelect(item)}
                  >
                    {renderItem(item, index)}
                  </TouchableOpacity>
                )
              }}
            />
          </View>
          <View
            style={{
              width: '100%',
              // paddingHorizontal: 16,
              paddingTop: 24,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowOffset: {
                width: 0,
                height: -34,
              },
              shadowOpacity: 2,
              shadowRadius: 4,
              elevation: 11,
            }}
          >
            <Button 
              type="outline"
              title={getLanguageString(language, 'CANCEL')}
              block
              onPress={onClose}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
      
    </CustomModal>
  )
}