/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import {ethers} from 'ethers';
import {getBalance} from '../../services/account';
import {getStakingAmount} from '../../services/staking';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';
import List from '../../components/List';
import Button from '../../components/Button';
import {truncate} from '../../utils/string';
import {parseKaiBalance} from '../../utils/number';
import IconButton from '../../components/IconButton';
import Modal from '../../components/Modal';
import {getLanguageString} from '../../utils/lang';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';

const {height: viewportHeight} = Dimensions.get('window');

const SelectWallet = ({
  mnemonic,
  onSelect,
  onCancel,
}: {
  mnemonic: string;
  onSelect: (wallet: Wallet) => void;
  onCancel: () => void;
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [walletList, setWalletList] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const language = useRecoilValue(languageAtom);
  const theme = useContext(ThemeContext);

  const handler = async () => {
    let newWalletList = [];
    for (let index = startIndex; index < startIndex + 5; index++) {
      const promise = new Promise<Wallet>(async (resolve) => {
        const ethWallet = ethers.Wallet.fromMnemonic(
          mnemonic.trim(),
          `m/44'/60'/0'/0/${index}`,
        );
        const walletAddress = ethWallet.address;
        const _privateKey = ethWallet.privateKey;
        const balance = await getBalance(walletAddress);
        const staked = await getStakingAmount(walletAddress);
        const wallet: Wallet = {
          privateKey: _privateKey,
          address: walletAddress,
          balance,
          staked,
        };
        resolve(wallet);
      });

      newWalletList.push(promise);
    }
    newWalletList = await Promise.all(newWalletList);
    setWalletList(newWalletList);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      handler();
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIndex]);

  return (
    <View style={styles.selectWalletContainer}>
      <Modal
        showCloseButton={false}
        visible={selectedIndex >= 0}
        contentStyle={{
          flex: 0.3,
          marginTop: viewportHeight / 3,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
          marginHorizontal: 14,
        }}
        onClose={() => setSelectedIndex(-1)}>
        <View style={{justifyContent: 'space-between', flex: 1}}>
          <Text style={{textAlign: 'center'}}>
            {getLanguageString(language, 'ARE_YOU_SURE')}
          </Text>
          <Text>{getLanguageString(language, 'RESTART_APP_DESCRIPTION')}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <Button
              title={getLanguageString(language, 'GO_BACK')}
              type="secondary"
              onPress={() => setSelectedIndex(-1)}
            />
            <Button
              loading={loading}
              disabled={loading}
              title={getLanguageString(language, 'SUBMIT')}
              onPress={() => {
                setLoading(true);
                setTimeout(() => {
                  const wallet = walletList[selectedIndex];
                  onSelect(wallet);
                }, 100);
              }}
            />
          </View>
        </View>
      </Modal>
      <Text
        style={{
          color: theme.textColor,
          textAlign: 'center',
          fontSize: 22,
          marginBottom: 20,
        }}>
        {loading
          ? getLanguageString(language, 'PROCESSING_YOUR_SEED')
          : getLanguageString(language, 'SELECT_YOUR_WALLET')}
      </Text>
      <View style={{flex: 0.5, justifyContent: 'center'}}>
        <List
          header={
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                paddingVertical: 15,
              }}>
              <IconButton
                name="chevron-left"
                color={theme.textColor}
                size={20}
                onPress={() => {
                  startIndex - 5 > 0 && setStartIndex(startIndex - 5);
                }}
                style={{paddingRight: 20}}
              />
              <IconButton
                name="chevron-right"
                color={theme.textColor}
                size={20}
                onPress={() => {
                  console.log('here');
                  setStartIndex(startIndex + 5);
                }}
              />
            </View>
          }
          loading={loading}
          loadingColor={theme.textColor}
          loadingSize="large"
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
              <View
                style={{
                  padding: 15,
                  flex: 1,
                  backgroundColor:
                    index % 2 === 0
                      ? theme.backgroundFocusColor
                      : theme.backgroundColor,
                }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}
                  onPress={() => setSelectedIndex(index)}>
                  <Text style={{color: theme.textColor}}>
                    {truncate(item.address, 10, 10)}
                  </Text>
                  <Text style={{color: theme.textColor}}>
                    {parseKaiBalance(item.balance)} KAI
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
      {!loading && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',
          }}>
          <Button
            type="outline"
            onPress={onCancel}
            size="large"
            title={getLanguageString(language, 'GO_BACK')}
          />
        </View>
      )}
    </View>
  );
};

export default SelectWallet;
