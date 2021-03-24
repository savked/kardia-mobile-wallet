/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useContext, useLayoutEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ThemeContext} from '../../ThemeContext';
import {addressBookAtom} from '../../atoms/addressBook';
import {languageAtom} from '../../atoms/language';
import CustomImagePicker from '../../components/ImagePicker';
import AntIcon from 'react-native-vector-icons/AntDesign';
import List from '../../components/List';
import {getLanguageString} from '../../utils/lang';
import {groupByAlphabet, truncate} from '../../utils/string';
import {styles} from './style';
import Button from '../../components/Button';
import NewAddressModal from '../common/NewAddressModal';
import {showTabBarAtom} from '../../atoms/showTabBar';

const AddressBookSetting = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const addressBook = useRecoilValue(addressBookAtom);
  const language = useRecoilValue(languageAtom);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  const [showNewAddressModal, setShowNewAddressModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <NewAddressModal
        visible={showNewAddressModal}
        onClose={() => setShowNewAddressModal(false)}
      />
      {groupByAlphabet(addressBook, 'name').length === 0 && (
        <View style={styles.noAddressContainer}>
          <Image
            style={{width: 170, height: 156, marginBottom: 23}}
            source={require('../../assets/no_address_dark.png')}
          />
          <Text style={[styles.emptyAddressBook, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_SAVED_ADDRESS')}
          </Text>
          <Button
            type="primary"
            // onPress={() => navigation.navigate('NewAddress')}
            onPress={() => setShowNewAddressModal(true)}
            title={getLanguageString(language, 'ADD_NEW_ADDRESS')}
            block={true}
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
      {groupByAlphabet(addressBook, 'name').map((group) => {
        return (
          <React.Fragment key={`address-group-${group.char}`}>
            <Text
              style={{
                marginHorizontal: 20,
                marginBottom: 8,
                color: theme.textColor,
              }}>
              {group.char}
            </Text>
            <List
              items={group.items}
              keyExtractor={(item) => item.address}
              containerStyle={{flex: 1}}
              render={(address: Address) => {
                return (
                  <TouchableOpacity
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
                      <Text
                        style={[
                          styles.addressName,
                          {color: theme.textColor, fontSize: 13},
                        ]}>
                        {address.name}
                      </Text>
                      <Text
                        style={[
                          styles.addressHash,
                          {
                            color: 'rgba(252, 252, 252, 0.54)',
                            fontSize: theme.defaultFontSize,
                          },
                        ]}>
                        {truncate(address.address, 15, 15)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default AddressBookSetting;
