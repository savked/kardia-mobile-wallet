import React, { useContext, useEffect, useState } from 'react';
import { Image, Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { filterByOwnerSelector } from '../../../atoms/krc20';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import CustomModal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import List from '../../../components/List';
import { getBalance } from '../../../services/krc20';
import { ThemeContext } from '../../../ThemeContext';
import { formatNumberString, parseDecimals } from '../../../utils/number';
import {styles} from './style'
import CustomTextInput from '../../../components/TextInput';
import { getLanguageString } from '../../../utils/lang';
import { languageAtom } from '../../../atoms/language';
import Button from '../../../components/Button';
import { getKAILogo } from '../../../services/dex';
import useIsKeyboardShown from '../../../hooks/isKeyboardShown';

export default ({visible, onClose, onSelect}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (params: {
    selectKAI: boolean, 
    tokenAddress?: string, 
    tokenSymbol?: string, 
    tokenDecimals?: number, 
    tokenAvatar?: string
  }) => void;
}) => {
  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const tokenList = useRecoilValue(filterByOwnerSelector(wallets[selectedWallet].address))
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [loading, setLoading] = useState(true);
  const keyboardShown = useIsKeyboardShown();
  const [searchQuery, setSearchQuery] = useState('')
  const [balance, setBalance] = useState<string[]>([]);

  const updateBalanceAll = async () => {
    setLoading(true);
    const promiseArr = tokenList.map((i) => {
      return getBalance(i.address, wallets[selectedWallet].address);
    });
    const balanceArr = await Promise.all(promiseArr);
    setBalance([...[wallets[selectedWallet].balance], ...balanceArr]);
    setLoading(false);
  }

  useEffect(() => {
    updateBalanceAll();
  }, [tokenList, selectedWallet]);

  const filterList = () => {
    const _tokenList = [
      ...[
        {
          address: '',
          id: 'KAI',
          name: 'KardiaChain',
          symbol: 'KAI',
          decimals: 18,
          avatar: getKAILogo()
        } as KRC20
      ],
      ...tokenList]
    if (!searchQuery) return _tokenList
    return _tokenList.filter((item) => {
      if (item.name.includes(searchQuery)) return true
      if (item.symbol.includes(searchQuery)) return true
      return false
    })
  }

  const getContentStyle = () => {
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
              source={require('../../../assets/logo.png')}
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

  const renderTokenItem = ({tokenAvatar, tokenName, tokenSymbol, tokenBalance, tokenDecimals, showBorder, tokenAddress}: {
    tokenAvatar: string,
    tokenName: string,
    tokenBalance: string,
    tokenSymbol: string,
    tokenDecimals: number,
    showBorder: boolean,
    tokenAddress: string,
  }) => {
    return (
      <View
        key={tokenName}
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
            flex: 1,
          }}
          onPress={() => {
            onSelect({
              selectKAI: tokenSymbol === 'KAI',
              tokenAddress,
              tokenSymbol,
              tokenDecimals,
              tokenAvatar,
            })
          }}>
          {renderIcon(tokenAvatar)}
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
              {tokenSymbol}
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
              {formatNumberString(parseDecimals(tokenBalance, tokenDecimals), 2)}
            </CustomText>
            <CustomText style={{color: theme.ghostTextColor}}>
              {tokenSymbol}
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
              render={(item: KRC20, index) => renderTokenItem({
                tokenAvatar: item.avatar || '',
                tokenName: item.name,
                tokenSymbol: item.symbol,
                tokenBalance: balance[index],
                tokenDecimals: item.decimals,
                showBorder: index !== filterList().length - 1,
                tokenAddress: item.address
              })}
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
              title={getLanguageString(language, 'CANCEL')}
              onPress={onClose}
              type="outline"
              style={{
                marginHorizontal: 16
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </CustomModal>
  );
}