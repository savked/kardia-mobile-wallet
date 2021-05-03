import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import ENIcon from 'react-native-vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToggleSwitch from 'toggle-switch-react-native';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import {styles} from './style';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { useFocusEffect } from '@react-navigation/native';
import CustomText from '../../components/Text';
import { getVerifiedTokenList } from '../../services/krc20';
import List from '../../components/List';
import { getTokenList, saveTokenList } from '../../utils/local';
import { krc20ListAtom } from '../../atoms/krc20';
import Button from '../../components/Button';

export default () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const navigation = useNavigation();

  const setTabBarVisible = useSetRecoilState(showTabBarAtom)

  const [loading, setLoading] = useState(true);
  const [verifiedTokenList, setVerifiedTokenList] = useState<KRC20[]>([])

  const setKRC20List = useSetRecoilState(krc20ListAtom)
  const [localKRC20List, setLocalKRC20List] = useState<KRC20[]>([]);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      const list = await getVerifiedTokenList();
      const listAddress = list.map((i) => i.address);
      const localTokens = await getTokenList();
      setVerifiedTokenList(list)
      setLocalKRC20List(localTokens.filter((i) => {
        return listAddress.includes(i.address)
      }));
      setLoading(false);
    })()
  }, []);

  const renderIcon = (avatar: string) => {
    return (
      <View style={{flex: 0.3, marginRight: 12}}>
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
            <Image source={{uri: avatar}} style={styles.tokenLogo} />
          ) : (
            <Image
              source={require('../../assets/logo.png')}
              style={styles.kaiLogo}
            />
          )}
        </View>
      </View>
    );
  };

  const handleAddToken = async () => {
    const localTokens = await getTokenList();
    const listAddress = (await getVerifiedTokenList()).map((i) => i.address);
    const customTokens = localTokens.filter((i) => {
      return !listAddress.includes(i.address)
    })

    const newTokenList = [...customTokens, ...localKRC20List]

    await saveTokenList(newTokenList);
    setKRC20List(newTokenList);
    navigation.goBack();
  }

  const toggleToken = (item: KRC20) => {
    const _localList: KRC20[] = JSON.parse(JSON.stringify(localKRC20List))
    const index = _localList.findIndex((i) => i.address === item.address)
    if (index > -1) {
      _localList.splice(index, 1)
    } else {
      _localList.push(item);
    }
    setLocalKRC20List(_localList)
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <ENIcon.Button
        style={{paddingHorizontal: 20}}
        name="chevron-left"
        onPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />
      <CustomText
        style={{color: theme.textColor, paddingHorizontal: 20, fontSize: 36}}>
        {getLanguageString(language, 'CHOOSE_VERIFIED_TOKENS')}
      </CustomText>
      <View style={{flex: 1, marginVertical: 12}}>
        <List
          keyExtractor={(item) => item.address}
          // items={validatorList.filter(filter)}
          items={verifiedTokenList}
          loading={loading}
          loadingSize="large"
          loadingColor={theme.textColor}
          render={(item: KRC20) => {
            return (
              <View
                key={item.address}
                style={{
                  padding: 15,
                  marginHorizontal: 20,
                  borderRadius: 8,
                  marginVertical: 6,
                  backgroundColor: theme.backgroundFocusColor,
                }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                  onPress={() => toggleToken(item)}>
                  {renderIcon(item.avatar || '')}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      height: '100%',
                    }}>
                    <CustomText
                      allowFontScaling={false}
                      style={{
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        fontSize: 16,
                      }}>
                      {item.symbol}
                    </CustomText>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      // flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}>
                    {/* <CustomText style={[styles.kaiAmount, {color: theme.textColor}]}>
                      {numeral(
                        parseDecimals(balance[index], item.decimals),
                      ).format('0,0.00')}
                    </CustomText> */}
                    {/* <CustomText style={{color: theme.ghostTextColor}}>
                      {item.symbol}
                    </CustomText> */}
                    <ToggleSwitch 
                      size="small" 
                      onColor="rgba(102, 136, 255, 1)" 
                      isOn={localKRC20List.map((i) => i.address).includes(item.address)} 
                      offColor="rgba(96, 99, 108, 1)"
                      onToggle={() => toggleToken(item)}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
      <View
        style={{
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffset: {
            width: 0,
            height: -16,
          },
          shadowOpacity: 2,
          shadowRadius: 4,
          elevation: 9,
        }}
      >
        <Button
          title={getLanguageString(language, 'DONE')}
          onPress={handleAddToken}
          style={{marginHorizontal: 20, marginBottom: 52}}
          textStyle={{
            fontWeight: '500',
            fontSize: theme.defaultFontSize + 3,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        />
      </View>
    </SafeAreaView>
  )
};