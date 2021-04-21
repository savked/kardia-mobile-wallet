import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import ENIcon from 'react-native-vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import NewTokenModal from '../common/NewTokenModal';
import {styles} from './style';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { useFocusEffect } from '@react-navigation/native';
import CustomText from '../../components/Text';
import { getVerifiedTokenList } from '../../services/krc20';
import List from '../../components/List';
import { parseDecimals } from '../../utils/number';
import { getTokenList, saveTokenList } from '../../utils/local';
import { krc20ListAtom } from '../../atoms/krc20';
import Button from '../../components/Button';

export default () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const navigation = useNavigation();

  const setTabBarVisible = useSetRecoilState(showTabBarAtom)
  const setKRC20List = useSetRecoilState(krc20ListAtom)

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifiedTokenList, setVerifiedTokenList] = useState<KRC20[]>([])

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      const list = await getVerifiedTokenList();
      const localTokens = await getTokenList();
      setVerifiedTokenList(list.filter((item) => {
        const index = localTokens.findIndex((localItem) => item.address === localItem.address)
        if (index >= 0) return false
        return true
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

  const handleAddToken = async (item: KRC20) => {
    const _tokenAddress =
      item.address.length === 42 ? item.address : `0x${item.address}`;

    let localTokens = await getTokenList();
    const existed = localTokens.some((i) => i.address === _tokenAddress);
    if (existed) {
      navigation.goBack();
      return;
    }

    const newTokenList: KRC20[] = JSON.parse(JSON.stringify(localTokens));

    newTokenList.push({
      address: _tokenAddress,
      name: item.name,
      symbol: item.symbol,
      decimals: item.decimals,
      avatar: item.avatar,
      id: item.address,
    });

    await saveTokenList(newTokenList);
    setKRC20List(newTokenList);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <NewTokenModal visible={showModal} onClose={() => {
        setShowModal(false)
        navigation.goBack()
      }} />
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
                  onPress={() => handleAddToken(item)}>
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
                    <CustomText style={{color: theme.ghostTextColor}}>
                      {item.symbol}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
      <Button
        title={getLanguageString(language, 'ADD_CUSTOM_TOKEN')}
        onPress={() => setShowModal(true)}
        style={{marginHorizontal: 20, marginBottom: 52}}
      />
    </SafeAreaView>
  )
};