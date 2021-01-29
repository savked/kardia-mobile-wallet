/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import numeral from 'numeral';
import List from '../../components/List';
import {getCurrentStaking, mapValidatorRole} from '../../services/staking';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';
import StakingItem from './StakingItem';
import AlertModal from '../../components/AlertModal';
import {useNavigation} from '@react-navigation/native';
import {weiToKAI} from '../../services/transaction/amount';
import Button from '../../components/Button';
import {statusBarColorAtom} from '../../atoms/statusBar';

const StakingScreen = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const wallets = useRecoilValue(walletsAtom);
  const navigation = useNavigation();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);

  const [currentStaking, setCurrentStaking] = useState<Staking[]>([]);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.primaryColor);
      return () => {
        setStatusBarColor(theme.backgroundColor);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    (async () => {
      if (!wallets[selectedWallet] || !wallets[selectedWallet].address) {
        return;
      }
      const _staking = await getCurrentStaking(wallets[selectedWallet].address);
      setCurrentStaking(_staking);
      if (loading === true) {
        setLoading(false);
      }
    })();
  }, [loading, selectedWallet, wallets]);

  const parseStakingItemForList = (item: Staking) => {
    return {
      label: item.validatorContractAddr,
      value: item.validatorContractAddr,
      name: item.name,
      stakedAmount: item.stakedAmount,
      claimableRewards: item.claimableRewards,
      withdrawableAmount: item.withdrawableAmount,
      unbondedAmount: item.unbondedAmount,
      role: mapValidatorRole(item.validatorRole),
    };
  };

  const getTotalSaving = () => {
    return currentStaking.reduce((total, item) => {
      return total + Number(weiToKAI(item.claimableRewards));
    }, 0);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={{flex: 1}}>
        <View
          style={{
            backgroundColor: theme.primaryColor,
            borderRadius: 8,
            padding: 12,
            paddingTop: 50,
          }}>
          <Text
            style={[
              styles.sectionTitle,
              {color: theme.textColor, textAlign: 'center'},
            ]}>
            {getLanguageString(language, 'TOTAL_EARNING')}
          </Text>
          <Text style={[styles.totalSaving, {color: theme.textColor}]}>
            {numeral(getTotalSaving()).format('0,0.00')}{' '}
            <Text style={{fontSize: 14}}>KAI</Text>
          </Text>
          <View style={styles.headerButtonGroup}>
            <Button
              title={getLanguageString(language, 'INVEST')}
              iconName="plus"
              type="outline"
              textStyle={{color: '#FFFFFF'}}
              onPress={() => navigation.navigate('ValidatorList')}
            />
          </View>
        </View>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.textColor,
              paddingHorizontal: 14,
              paddingVertical: 20,
            },
          ]}>
          {getLanguageString(language, 'YOUR_INVESTMENTS')}
        </Text>
        <List
          loading={loading}
          loadingColor={theme.primaryColor}
          items={currentStaking.map(parseStakingItemForList)}
          listStyle={{paddingHorizontal: 15}}
          ListEmptyComponent={
            <Text style={[styles.noStakingText, {color: theme.textColor}]}>
              {getLanguageString(language, 'NO_STAKING_ITEM')}
            </Text>
          }
          render={(item) => {
            return (
              <StakingItem
                item={item}
                showModal={(
                  _message: string,
                  _messageType: string,
                  cb: () => void,
                ) => {
                  setMessage(_message);
                  setMessageType(_messageType);
                  cb();
                }}
              />
            );
          }}
          ItemSeprator={() => <View style={{height: 6}} />}
        />
      </View>
      {message !== '' && (
        <AlertModal
          type={messageType as any}
          message={message}
          onClose={() => {
            setMessage('');
          }}
          visible={true}
        />
      )}
    </View>
  );
};

export default StakingScreen;
