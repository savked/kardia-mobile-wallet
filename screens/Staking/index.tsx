/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import IconButton from '../../components/IconButton';
import List from '../../components/List';
import {getCurrentStaking, mapValidatorRole} from '../../services/staking';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';
import StakingItem from './StakingItem';
import AlertModal from '../../components/AlertModal';
import {useNavigation} from '@react-navigation/native';
import {statusBarColorAtom} from '../../atoms/statusBar';

const StakingScreen = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const wallets = useRecoilValue(walletsAtom);
  const navigation = useNavigation();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

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
      const _staking = await getCurrentStaking(wallets[selectedWallet].address);
      setCurrentStaking(_staking);
    })();
  }, [selectedWallet, wallets]);

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

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.header}>
        <Text style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'STAKING_SCREEN_TITLE')}
        </Text>
        <IconButton
          name="plus-circle"
          color={theme.textColor}
          size={styles.headline.fontSize}
          onPress={() => navigation.navigate('NewStaking')}
        />
      </View>
      <View style={{flex: 1}}>
        <List
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
