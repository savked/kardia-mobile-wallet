/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import {formatDistanceToNowStrict, isSameDay, format} from 'date-fns';
import React, {useContext, useEffect, useState} from 'react';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {selectedWalletAtom} from '../../atoms/wallets';
import List from '../../components/List';
import {getTx} from '../../services/krc20';
import {ThemeContext} from '../../ThemeContext';
import {
  getDateFNSLocale,
  getDateTimeFormat,
  getLanguageString,
} from '../../utils/lang';
import {getSelectedWallet, getWallets} from '../../utils/local';
import {parseKaiBalance} from '../../utils/number';
import {truncate} from '../../utils/string';
import {styles} from './style';

const TokenTxList = ({
  tokenAddress,
  tokenAvatar,
  tokenSymbol,
}: {
  tokenAddress: string;
  tokenAvatar: string;
  tokenSymbol: string;
}) => {
  const navigation = useNavigation();
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const [txList, setTxList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const _wallets = await getWallets();
      const _selectedWallet = await getSelectedWallet();
      const _txList = await getTx(
        tokenAddress,
        _wallets[_selectedWallet].address,
      );
      setTxList(_txList);
      setLoading(false);
    })();
  }, [selectedWallet, tokenAddress]);

  const renderIcon = (status: number) => {
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
          {tokenAvatar ? (
            <Image source={{uri: tokenAvatar}} style={styles.tokenLogo} />
          ) : (
            <Image
              source={require('../../assets/logo.png')}
              style={styles.kaiLogo}
            />
          )}
          {status ? (
            <AntIcon
              name="checkcircle"
              size={20}
              color={'green'}
              style={{position: 'absolute', right: 0, bottom: 0}}
            />
          ) : (
            <AntIcon
              name="closecircle"
              size={20}
              color={'red'}
              style={{position: 'absolute', right: 0, bottom: 0}}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <List
      items={txList}
      loading={loading}
      loadingColor={theme.textColor}
      keyExtractor={(item) => item.txHash}
      render={(item, index) => {
        return (
          <View
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
                const _item = JSON.parse(JSON.stringify(item));
                delete _item.date;
                navigation.navigate('Home', {
                  screen: 'TokenTxDetail',
                  initial: false,
                  params: {
                    txData: _item,
                    tokenInfo: {
                      id: tokenAddress,
                      address: tokenAddress,
                      symbol: tokenSymbol,
                      avatar: tokenAvatar,
                    },
                  },
                });
              }}>
              {/** TODO: Uncomment below code after backend updated */}
              {/* {renderIcon(item.status)} */}
              {renderIcon(1)}
              <View
                style={{
                  flex: 2.5,
                  flexDirection: 'column',
                }}>
                <Text style={{color: '#FFFFFF'}}>
                  {truncate(item.transactionHash, 6, 8)}
                </Text>
                <Text style={{color: 'gray'}}>
                  {isSameDay(item.date, new Date())
                    ? `${formatDistanceToNowStrict(item.date, {
                        locale: getDateFNSLocale(language),
                      })} ${getLanguageString(language, 'AGO')}`
                    : format(item.date, getDateTimeFormat(language), {
                        locale: getDateFNSLocale(language),
                      })}
                </Text>
              </View>
              <View
                style={{
                  flex: 2.5,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={[
                    styles.kaiAmount,
                    item.type === 'IN' ? {color: '#61b15a'} : {color: 'red'},
                  ]}>
                  {item.type === 'IN' ? '+' : '-'}
                  {parseKaiBalance(item.arguments.value)} {tokenSymbol}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={[styles.noTXText, {color: theme.textColor}]}>
          {getLanguageString(language, 'NO_TRANSACTION')}
        </Text>
      }
      header={
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'}}>
            {getLanguageString(language, 'RECENT_TRANSACTION')}
          </Text>
        </View>
      }
    />
  );
};

export default TokenTxList;
