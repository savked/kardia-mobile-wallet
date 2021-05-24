/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ethers} from 'ethers';
import {getBalance} from '../../services/account';
import {getStakingAmount} from '../../services/staking';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';
import List from '../../components/List';
import Button from '../../components/Button';
import {truncate} from '../../utils/string';
import {parseKaiBalance} from '../../utils/number';
import Icon from 'react-native-vector-icons/Entypo';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {
  getWallets,
  saveMnemonic,
} from '../../utils/local';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/Text';
import { statusBarColorAtom } from '../../atoms/statusBar';
import { sleep } from '../../utils/promiseHelper';

const SelectWallet = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [walletList, setWalletList] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const language = useRecoilValue(languageAtom);
  const theme = useContext(ThemeContext);

  const navigation = useNavigation();
  const {params} = useRoute();
  const mnemonic = params ? (params as any).mnemonic : '';

  const setWallets = useSetRecoilState(walletsAtom);
  const setSelectedWallet = useSetRecoilState(selectedWalletAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onSelect = async (_wallet: Wallet) => {
    const localWallets = await getWallets();
    const _privateKey = _wallet.privateKey;
    const walletAddress = _wallet.address;
    const balance = await getBalance(walletAddress);
    const staked = await getStakingAmount(walletAddress);

    const wallet: Wallet = {
      privateKey: _privateKey,
      address: walletAddress,
      balance,
      staked,
      undelegating: 0
    };

    const walletExisted = localWallets
      .map((item) => item.address)
      .includes(wallet.address);

    if (walletExisted) {
      Alert.alert(getLanguageString(language, 'WALLET_EXISTED'));
      return;
    }

    await saveMnemonic(
      walletAddress,
      mnemonic !== '' ? mnemonic.trim() : 'FROM_PK',
    );
    const _wallets = JSON.parse(JSON.stringify(localWallets));
    _wallets.push(wallet);
    // await saveWallets(_wallets);
    // await saveSelectedWallet(_wallets.length - 1);
    setSelectedWallet(_wallets.length - 1);
    setWallets(_wallets);
    if (params && (params as any).fromNoWallet) {
      return;
    } 
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  // const onError = (error: any) => {};

  const handler = async () => {
    try {
      let newWalletList: Promise<Wallet>[] = [];
      const indexArr = [startIndex, startIndex + 1, startIndex + 2, startIndex + 3, startIndex + 4]
      indexArr.forEach((index) => {
        const promise = new Promise<Wallet>(async (resolve, reject) => {
          const ethWallet = ethers.Wallet.fromMnemonic(
            mnemonic.trim(),
            `m/44'/60'/0'/0/${index}`,
          );
          const walletAddress = ethWallet.address;
          const _privateKey = ethWallet.privateKey;
          try {
            const balance = await getBalance(walletAddress);
            const staked = await getStakingAmount(walletAddress);
            const wallet: Wallet = {
              privateKey: _privateKey,
              address: walletAddress,
              balance,
              staked,
              undelegating: 0,
              name: 'New Wallet'
            };
            resolve(wallet);
          } catch (error) {
            reject(error);
          }
        });

        newWalletList.push(promise);
      })
      const newWalletListRs = await Promise.all(newWalletList);
      const currentWalletList: Wallet[] = JSON.parse(
        JSON.stringify(walletList),
      );
      setWalletList(currentWalletList.concat(newWalletListRs));
      setLoading(false);
    } catch (error) {
      console.error(error);
      // onError && onError(error);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await sleep(1)
      handler()
    })()
    // setLoading(true);
    // setTimeout(() => {
    //   handler();
    // }, 0.1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIndex]);

  return (
    <SafeAreaView
      style={[
        styles.selectWalletContainer,
        {backgroundColor: theme.backgroundColor},
      ]}>
      <Icon.Button
        style={{paddingLeft: 0}}
        name="chevron-left"
        onPress={() => navigation.goBack()}
        backgroundColor="transparent"
      />
      <CustomText
        style={{
          color: theme.textColor,
          // textAlign: 'center',
          fontSize: 36,
          marginBottom: 20,
        }}>
        {getLanguageString(language, 'SELECT_YOUR_WALLET')}
      </CustomText>
      {/* <CustomText style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: 16}}>
        {getLanguageString(language, 'SELECT_YOUR_WALLET_DESCRIPTION')}
      </CustomText> */}
      <View style={{flex: 0.8, justifyContent: 'center', marginTop: 36}}>
        {walletList.length > 0 && (
          <List
            // loading={loading}
            // loadingColor={theme.textColor}
            // loadingSize="large"
            items={walletList.map((item) => {
              return {
                ...item,
                ...{
                  label: item.address,
                  value: item.address,
                },
              };
            })}
            render={(item, index) => {
              return (
                <TouchableOpacity
                  style={[
                    styles.walletItem,
                    {
                      backgroundColor: theme.backgroundFocusColor,
                    },
                  ]}
                  onPress={() => onSelect(walletList[index])}>
                  <View
                    style={{
                      backgroundColor: theme.backgroundColor,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                      marginRight: 16,
                    }}>
                    <Image
                      style={{width: 20, height: 20}}
                      source={require('../../assets/icon/home_dark.png')}
                    />
                  </View>
                  <View>
                    <CustomText style={{color: theme.textColor, fontSize: 13}}>
                      {truncate(item.address, 10, 10)}
                    </CustomText>
                    <CustomText
                      style={{
                        color: theme.textColor,
                        fontSize: theme.defaultFontSize,
                      }}>
                      <CustomText style={{color: theme.mutedTextColor}}>
                        Balance:
                      </CustomText>{' '}
                      {parseKaiBalance(item.balance)} KAI
                    </CustomText>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
        {loading && (
          <ActivityIndicator size={'large'} color={theme.textColor} />
        )}
      </View>
      {!loading && (
        <Button
          type="outline"
          onPress={() => setStartIndex(startIndex + 5)}
          size="large"
          title={getLanguageString(language, 'LOAD_MORE_WALLET')}
          style={{marginTop: 12}}
        />
      )}
    </SafeAreaView>
  );
};

export default SelectWallet;
