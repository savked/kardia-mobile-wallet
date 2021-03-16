/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import List from '../../components/List';
import {styles} from './style';
import {parseKaiBalance} from '../../utils/number';
import Button from '../../components/Button';
import {useRecoilValue} from 'recoil';
import numeral from 'numeral';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
// import {getTokenList} from '../../utils/local';
import NewTokenModal from '../common/NewTokenModal';
import {krc20ListAtom} from '../../atoms/krc20';
import {getBalance} from '../../services/krc20';
import {getSelectedWallet, getWallets} from '../../utils/local';
import {selectedWalletAtom} from '../../atoms/wallets';

const TokenListSection = () => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  const selectedWallet = useRecoilValue(selectedWalletAtom);

  const language = useRecoilValue(languageAtom);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [balance, setBalance] = useState<number[]>([]);
  const tokenList = useRecoilValue(krc20ListAtom);

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
  }, [tokenList, selectedWallet]);

  const renderIcon = (avatar: string) => {
    return (
      <View style={{flex: 1, marginRight: 18}}>
        <View
          style={{
            width: 50,
            height: 50,

            borderRadius: 25,
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
    <View style={styles.tokenListContainer}>
      <NewTokenModal visible={showModal} onClose={() => setShowModal(false)} />
      <List
        items={tokenList}
        loading={loading}
        loadingColor={theme.textColor}
        keyExtractor={(item) => item.id}
        render={(item, index) => {
          return (
            <View
              key={item.name}
              style={{
                padding: 15,
                backgroundColor:
                  index % 2 === 0
                    ? theme.backgroundFocusColor
                    : theme.backgroundColor,
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
                      // balance: balance[index],
                    },
                  });
                }}>
                {renderIcon(item.avatar)}
                <View
                  style={{
                    flex: 2.5,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                    {item.name}
                  </Text>
                  <Text style={{color: 'gray'}}>
                    $ {numeral(item.price).format('0,0.00')}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 2.5,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text style={[styles.kaiAmount, {color: theme.textColor}]}>
                    {parseKaiBalance(balance[index])} {item.symbol}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.noTXText, {color: theme.textColor}]}>
            {getLanguageString(language, 'NO_TOKENS')}
          </Text>
        }
        header={
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
            }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'}}>
              {getLanguageString(language, 'KRC20_TOKENS_SECTION_TITLE')}
            </Text>
            <Button
              type="link"
              onPress={() => setShowModal(true)}
              title={`+ ${getLanguageString(language, 'ADD_TOKEN')}`}
            />
          </View>
        }
      />
    </View>
  );
};

export default TokenListSection;
