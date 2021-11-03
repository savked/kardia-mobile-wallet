import { useNavigation } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntIcon from 'react-native-vector-icons/AntDesign';
import ENIcon from 'react-native-vector-icons/Entypo';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { filterByOwnerSelector } from '../../atoms/krc20';
import { languageAtom } from '../../atoms/language';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import Button from '../../components/Button';
import List from '../../components/List';
import CustomText from '../../components/Text';
import { getBalance } from '../../services/krc20';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getSelectedWallet, getWallets } from '../../utils/local';
import { formatNumberString, parseDecimals } from '../../utils/number';
import { styles } from './style';

export default () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom)

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const wallets = useRecoilValue(walletsAtom);
  const tokenList = useRecoilValue(filterByOwnerSelector(wallets[selectedWallet].address))

  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const _wallets = await getWallets();
      const _selectedWallet = await getSelectedWallet();
      const promiseArr = tokenList.map((i) => {
        return getBalance(i.address, _wallets[_selectedWallet].address);
      });
      const balanceArr = await Promise.all(promiseArr);
      setBalance(balanceArr);
      setLoading(false);
    })();
  }, [tokenList, wallets, selectedWallet]);

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

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View
        style={{
          width: '100%',
          marginBottom: 19,
          paddingHorizontal: 20,
        }}>
        <ENIcon.Button
          name="chevron-left"
          onPress={() => navigation.goBack()}
          backgroundColor="transparent"
          style={{ padding: 0 }}
        />
      </View>
      <CustomText style={{fontSize: 36, paddingHorizontal: 20, color: theme.textColor}}>{getLanguageString(language, 'KRC20_TOKENS_SECTION_TITLE')}</CustomText>
      <List
        items={tokenList.filter((item) => {
          if (!item.walletOwnerAddress) return true
          if (item.walletOwnerAddress === wallets[selectedWallet].address) return true
          return false
        })}
        loading={loading}
        loadingColor={theme.textColor}
        keyExtractor={(item) => item.id}
        render={(item, index) => {
          return (
            <View
              key={item.name}
              style={{
                padding: 15,
                marginHorizontal: 20,
                borderRadius: 8,
                marginTop: 12,
                backgroundColor: theme.backgroundFocusColor,
              }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}
                onPress={() => {
                  navigation.navigate('Home', {
                    screen: 'TokenDetail',
                    initial: false,
                    params: {
                      tokenAddress: item.address,
                      name: item.name,
                      symbol: item.symbol,
                      avatar: item.avatar,
                      decimals: item.decimals,
                      // balance: balance[index],
                    },
                  });
                }}>
                {renderIcon(item.avatar)}
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    height: '100%',
                  }}>
                  <CustomText
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
                  <CustomText style={[styles.kaiAmount, {color: theme.textColor}]}>
                    {/* {numeral(
                      parseDecimals(balance[index], item.decimals),
                    ).format('0,0.00')} */}
                    {formatNumberString(parseDecimals(balance[index], item.decimals), 2)}
                  </CustomText>
                  <CustomText style={{color: theme.ghostTextColor}}>
                    {item.symbol}
                  </CustomText>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={null}
      />
      <Button
        type="primary"
        icon={<AntIcon name="plus" size={24} />}
        size="small"
        onPress={() => navigation.navigate('NewKRC20Tokens')}
        style={styles.floatingButton}
      />
    </SafeAreaView>
  );
};
