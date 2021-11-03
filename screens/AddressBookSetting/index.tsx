/* eslint-disable react-native/no-inline-styles */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntIcon from 'react-native-vector-icons/AntDesign';
import ENIcon from 'react-native-vector-icons/Entypo';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { addressBookAtom } from '../../atoms/addressBook';
import { languageAtom } from '../../atoms/language';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { statusBarColorAtom } from '../../atoms/statusBar';
import Button from '../../components/Button';
import CustomImagePicker from '../../components/ImagePicker';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { groupByAlphabet, truncate } from '../../utils/string';
import NewAddressModal from '../common/NewAddressModal';
import { styles } from './style';

const AddressBookSetting = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const addressBook = useRecoilValue(addressBookAtom);
  const language = useRecoilValue(languageAtom);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const [showNewAddressModal, setShowNewAddressModal] = useState(false);

  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View
      style={[styles.container, {backgroundColor: theme.backgroundColor, paddingTop: insets.top}]}>
      <NewAddressModal
        visible={showNewAddressModal}
        onClose={() => setShowNewAddressModal(false)}
      />
      <ENIcon.Button
        style={{paddingHorizontal: 20}}
        name="chevron-left"
        onPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />
      <View style={styles.header}>
        <CustomText style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'ADDRESS_BOOK_MENU')}
        </CustomText>
        {/* <IconButton
          name="bell-o"
          color={theme.textColor}
          size={20}
          onPress={() => navigation.navigate('Notification')}
        /> */}
      </View>
      {groupByAlphabet(addressBook, 'name').length === 0 && (
        <View style={styles.noAddressContainer}>
          <Image
            style={{width: 170, height: 156, marginBottom: 23, marginTop: 70}}
            source={require('../../assets/no_address_dark.png')}
          />
          <CustomText style={[styles.emptyAddressBook, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_SAVED_ADDRESS')}
          </CustomText>
          <CustomText style={{color: theme.mutedTextColor, fontWeight: '500', fontSize: 15, marginBottom: 32, textAlign: 'center'}}>
            {getLanguageString(language, 'NO_SAVED_ADDRESS_SUB_TEXT')}
          </CustomText>
          <Button
            type="primary"
            // onPress={() => navigation.navigate('NewAddress')}
            onPress={() => setShowNewAddressModal(true)}
            title={getLanguageString(language, 'ADD_NEW_ADDRESS')}
            style={{width: 248}}
            textStyle={Platform.OS === 'android' ? {fontFamily: 'WorkSans-SemiBold', fontSize: theme.defaultFontSize + 3}  : {fontWeight: '500', fontSize: theme.defaultFontSize + 3}}
            icon={
              <AntIcon
                name="plus"
                size={20}
                color={'#000000'}
                style={{marginRight: 8}}
              />
            }
          />
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {groupByAlphabet(addressBook, 'name').map((group) => {
          return (
            <React.Fragment key={`address-group-${group.char}`}>
              <CustomText
                style={{
                  marginHorizontal: 20,
                  marginBottom: 8,
                  color: theme.textColor,
                }}>
                {group.char}
              </CustomText>
              {group.items.map((address: Address) => {
                return (
                  <TouchableOpacity
                    key={address.address}
                    style={[
                      styles.addressContainer,
                      {backgroundColor: theme.backgroundFocusColor},
                    ]}
                    onPress={() =>
                      navigation.navigate('AddressDetail', {
                        addressHash: address.address,
                      })
                    }>
                    {address.avatar ? (
                      <CustomImagePicker
                        image={{uri: address.avatar}}
                        editable={false}
                        style={styles.addressAvatarContainer}
                        imageStyle={styles.addressAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.noAvatarContainer,
                          {
                            backgroundColor: theme.backgroundColor,
                          },
                        ]}>
                        <Image
                          style={{width: 20, height: 20}}
                          source={require('../../assets/icon/user.png')}
                        />
                      </View>
                    )}
                    <View>
                      <CustomText
                        style={[
                          styles.addressName,
                          {color: theme.textColor, fontSize: 13},
                        ]}>
                        {address.name}
                      </CustomText>
                      <CustomText
                        allowFontScaling={false}
                        style={[
                          styles.addressHash,
                          {
                            color: 'rgba(252, 252, 252, 0.54)',
                            fontSize: theme.defaultFontSize,
                          },
                        ]}>
                        {truncate(address.address, 15, 15)}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </React.Fragment>
          );
        })}
      </ScrollView>
      {addressBook.length !== 0 && (
        <Button
          type="primary"
          icon={<AntIcon name="plus" size={24} />}
          size="small"
          onPress={() => setShowNewAddressModal(true)}
          style={styles.floatingButton}
        />
      )}
    </View>
  );
};

export default AddressBookSetting;
