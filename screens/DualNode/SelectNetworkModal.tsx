import React, { useContext } from 'react'
import { Image, Platform, TouchableOpacity, View, ViewStyle } from 'react-native'
import List from '../../components/List'
import CustomModal from '../../components/Modal'
import CustomText from '../../components/Text'
import { ThemeContext } from '../../ThemeContext'
import { getSemiBoldStyle } from '../../utils/style'

export default ({visible, onClose, networkList, onSelect}: {
  visible: boolean;
  onClose: () => void;
  networkList: DualNodeChain[];
  onSelect: (chain: DualNodeChain) => void
}) => {

  const theme = useContext(ThemeContext)

  const getContentStyle: () => ViewStyle = () => {
    if (Platform.OS === 'android') {
      return {
        backgroundColor: theme.backgroundFocusColor,
        height: 520,
        padding: 0,
        paddingTop: 32,
        paddingBottom: 52,
      }
    }
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 520,
      padding: 0,
      paddingTop: 32,
      paddingBottom: 52
    }
  }

  const renderIcon = (avatar: string) => {
    return (
      <View style={{marginRight: 12}}>
        <View
          style={{
            width: 30,
            height: 30,

            borderRadius: 15,
            backgroundColor: 'white',

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            borderWidth: 1,
            borderColor: 'gray',
          }}>
          {avatar ? (
            <Image 
              source={{uri: avatar}} 
              style={{
                width: 30,
                height: 30,
                borderRadius: 25,
              }} 
            />
          ) : (
            <Image
              source={require('../../assets/logo.png')}
              style={{
                width: 30,
                height: 30,
                borderRadius: 25,
              }}
            />
          )}
        </View>
      </View>
    );
  };

  const renderTokenItem = ({chainItem, showBorder}: {
    chainItem: DualNodeChain,
    showBorder: boolean,
  }) => {
    return (
      <View
        key={chainItem.name}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: 'transparent',
          width: '100%',
          borderBottomColor: showBorder ? '#60636C' : 'transparent',
          borderBottomWidth: 1
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
          }}
          onPress={() => {
            onSelect(chainItem)
          }}>
          {renderIcon(chainItem.icon)}
          <View
            style={{
              // flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              height: '100%',
            }}>
            <CustomText
              allowFontScaling={false}
              style={[{
                color: theme.textColor,
                fontSize: theme.defaultFontSize + 1,
              }, getSemiBoldStyle()]}>
              {chainItem.name.toUpperCase()}
            </CustomText>
            <CustomText
              allowFontScaling={false}
              style={[{
                color: theme.mutedTextColor,
                fontSize: theme.defaultFontSize,
              }, getSemiBoldStyle()]}>
              {chainItem.supportedTokenStandard.join(', ')}
            </CustomText>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={getContentStyle()}
    >
      <List
        listStyle={{
          width: '100%',
          flex: 1
        }}
        items={networkList}
        keyExtractor={(item: DualNodeChain) => item.name}
        render={(item: DualNodeChain, index) => renderTokenItem({
          chainItem: item,
          showBorder: index !== networkList.length - 1,
        })}
      />
    </CustomModal>
  )
}