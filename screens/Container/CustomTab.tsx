import React, { useContext } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, Image, Dimensions, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import CustomText from '../../components/Text';
import { getLanguageString } from '../../utils/lang';
import { showTabBarAtom } from '../../atoms/showTabBar';

const {width: viewportWidth} = Dimensions.get('window')

export default ({ state, descriptors, navigation, theme }: any) => {

  const language = useRecoilValue(languageAtom)
  const showTabBar = useRecoilValue(showTabBarAtom);

  if (!showTabBar) {
    return null
  }

  return (
    <View 
      style={{ 
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row', 
        height: 80,
        width: viewportWidth,
        backgroundColor: theme.backgroundFocusColor,
        borderTopColor: theme.backgroundFocusColor,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 2,
        shadowRadius: 4,
      }}
    >
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, params: {} });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const renderLabel = ({focused}: {
          focused: boolean;
        }) => {
          if (route.name === 'Home') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'HOME')}
              </CustomText>
            )
          } else if (route.name === 'Transaction') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'TRANSACTIONS')}
              </CustomText>
            )
          } else if (route.name === 'Staking') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'STAKING')}
              </CustomText>
            )
          } else if (route.name === 'Address') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'ADDRESS_BOOK')}
              </CustomText>
            )
          } else if (route.name === 'Setting') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'SETTING')}
              </CustomText>
            )
          } else if (route.name === 'DualNode') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'DUAL_NODE')}
              </CustomText>
            )
          } else if (route.name === 'DEX') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'KAI_DEX')}
              </CustomText>
            )
          } else if (route.name === 'DApp') {
            return (
              <CustomText style={{fontSize: 10, color: focused ? theme.textColor : '#7A859A'}}>
                {getLanguageString(language, 'DAPP')}
              </CustomText>
            )
          }
        }

        const renderIcon = ({color, size, focused}: {color: string, size: number, focused: boolean}) => {
          let iconName = '';

          if (route.name === 'Home') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/home_dark.png')
                    : require('../../assets/icon/home_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'News') {
            iconName = 'newspaper-o';
          } else if (route.name === 'Transaction') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/transaction_dark.png')
                    : require('../../assets/icon/transaction_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'Setting') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/setting_dark.png')
                    : require('../../assets/icon/setting_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'DualNode') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/setting_dark.png')
                    : require('../../assets/icon/setting_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'Staking') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/staking_dark.png')
                    : require('../../assets/icon/staking_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'Address') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/address_book_dark.png')
                    : require('../../assets/icon/address_book_dark_inactive.png')
                }
              />
            );
          } else if (route.name === 'DEX') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/kai_dex_dark.png')
                    : require('../../assets/icon/kai_dex_dark_inactive.png')
                }
              />
            )
          } else if (route.name === 'DApp') {
            return (
              <Image
                style={{width: 24, height: 24, marginTop: 12, marginBottom: 2}}
                source={
                  focused
                    ? require('../../assets/icon/dapp.png')
                    : require('../../assets/icon/dapp_inactive.png')
                }
              />
            )
          }

          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        }

        return (
          <TouchableOpacity
            key={`tab-item-${index}`}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ 
              width: viewportWidth / 5 ,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderIcon({color: 'transparent', size: 24, focused: isFocused})}
            {renderLabel({focused: isFocused})}
          </TouchableOpacity>
        );
      })}
      {/* </ScrollView> */}
    </View>
  );
}