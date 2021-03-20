/* eslint-disable react-native/no-inline-styles */
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {krc20ListAtom} from '../../atoms/krc20';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {DEFAULT_KRC20_TOKENS} from '../../config';
import {getBalance} from '../../services/krc20';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {
  getSelectedWallet,
  getTokenList,
  getWallets,
  saveTokenList,
} from '../../utils/local';
import {parseDecimals} from '../../utils/number';
import AddressQRModal from '../common/AddressQRCode';
import {styles} from './style';
import TokenTxList from './TokenTxList';
import numeral from 'numeral';

const TokenDetail = () => {
  const theme = useContext(ThemeContext);
  const navigation = useNavigation();
  const {params} = useRoute();
  const tokenAvatar = params ? (params as Record<string, any>).avatar : '';
  // const tokenBalance = params ? (params as Record<string, any>).balance : 0;
  const tokenSymbol = params ? (params as Record<string, any>).symbol : '';
  const tokenAddress = params
    ? (params as Record<string, any>).tokenAddress
    : '';
  const tokenDecimals = params ? (params as Record<string, any>).decimals : 18;

  const language = useRecoilValue(languageAtom);

  const [showAddressQR, setShowAddressQR] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const setTokenList = useSetRecoilState(krc20ListAtom);

  const fetchBalance = async () => {
    const _wallets = await getWallets();
    const _selectedWallet = await getSelectedWallet();
    const wallet = _wallets[_selectedWallet];
    const _balance = await getBalance(tokenAddress, wallet.address);
    setTokenBalance(_balance);
  };

  const removeToken = async (_tokenAddress: string) => {
    const localTokens = await getTokenList();

    const DEFAULT_ID = DEFAULT_KRC20_TOKENS.map((i) => i.id);

    const newLocalTokens = localTokens.filter(
      (i) => i.address !== _tokenAddress && !DEFAULT_ID.includes(i.address),
    );
    await saveTokenList(newLocalTokens);
    setTokenList(newLocalTokens);
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger
            customStyles={{
              triggerOuterWrapper: {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              },
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: {
                width: 27,
                height: 27,
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}>
            <Icon name="cog" color="#FFFFFF" size={27} />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionWrapper: {
                padding: 12,
              },
            }}>
            <MenuOption onSelect={() => removeToken(tokenAddress)}>
              <Text>{getLanguageString(language, 'REMOVE_TOKEN')}</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, navigation, tokenAddress]);

  useEffect(() => {
    (async () => {
      await fetchBalance();
      const intervalId = setInterval(async () => {
        await fetchBalance();
      }, 2000);
      return () => {
        clearInterval(intervalId);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress]);

  const renderIcon = (avatar: string) => {
    return (
      <View
        style={{
          width: 60,
          height: 60,

          borderRadius: 30,
          backgroundColor: 'white',

          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',

          marginBottom: 12,
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
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <AddressQRModal
        visible={showAddressQR}
        onClose={() => setShowAddressQR(false)}
      />
      <View
        style={{
          flex: 1,
          width: '100%',
          alignItems: 'center',
          paddingVertical: 20,
          borderBottomColor: '#C4C4C4',
          borderBottomWidth: 0.3,
        }}>
        {renderIcon(tokenAvatar)}
        <Text style={{fontSize: 20, color: theme.textColor}}>
          {numeral(parseDecimals(tokenBalance, tokenDecimals)).format('0,0.00')}{' '}
          {tokenSymbol}
        </Text>
        <View style={styles.buttonGroupContainer}>
          <Button
            title={getLanguageString(language, 'SEND_TOKEN').replace(
              '{{TOKEN_SYMBOL}}',
              tokenSymbol,
            )}
            type="outline"
            onPress={() => {
              navigation.navigate('Home', {
                screen: 'NewKRC20Tx',
                params: {
                  tokenAddress,
                  tokenSymbol,
                  tokenDecimals,
                },
              });
            }}
            iconName="paper-plane"
            // size="small"
            textStyle={{color: '#FFFFFF'}}
            style={{marginRight: 5}}
          />

          <Button
            onPress={() => setShowAddressQR(true)}
            title={getLanguageString(language, 'RECEIVE_TOKEN').replace(
              '{{TOKEN_SYMBOL}}',
              tokenSymbol,
            )}
            // size="small"
            type="outline"
            iconName="download"
            style={{marginLeft: 5, marginRight: 5}}
            textStyle={{color: '#FFFFFF'}}
          />
        </View>
      </View>
      <View style={{flex: 3, width: '100%'}}>
        <TokenTxList
          tokenAddress={tokenAddress}
          tokenAvatar={tokenAvatar}
          tokenSymbol={tokenSymbol}
          tokenDecimals={tokenDecimals}
        />
      </View>
    </View>
  );
};

export default TokenDetail;
