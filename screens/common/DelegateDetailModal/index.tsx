/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {Text, View} from 'react-native';
import Divider from '../../../components/Divider';
import Modal from '../../../components/Modal';
import TextAvatar from '../../../components/TextAvatar';
import {ThemeContext} from '../../../ThemeContext';
import {getLanguageString} from '../../../utils/lang';
import numeral from 'numeral';
import {styles} from './style';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import {weiToKAI} from '../../../services/transaction/amount';
import Button from '../../../components/Button';
import {getSelectedWallet, getWallets} from '../../../utils/local';
import {withdrawReward} from '../../../services/staking';

export default ({
  validatorItem,
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
  validatorItem: any;
}) => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const [claiming, setClaiming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const getSelectedCommission = () => {
    const formatted = numeral(validatorItem.commissionRate).format('0,0.00');
    return formatted === 'NaN' ? '0 %' : `${formatted} %`;
  };

  const getSelectedStakedAmount = () => {
    const formatted = numeral(weiToKAI(validatorItem.stakedAmount)).format(
      '0,0.00',
    );
    return formatted === 'NaN' ? '0 KAI' : `${formatted} KAI`;
  };

  const claimHandler = async () => {
    try {
      setClaiming(true);
      const wallets = await getWallets();
      const selectedWallet = await getSelectedWallet();
      await withdrawReward(validatorItem.value, wallets[selectedWallet]);
      setClaiming(false);
      onClose();
      // showModal(
      //   getLanguageString(language, 'CLAIM_SUCCESS').replace(
      //     '{{KAI_AMOUNT}}',
      //     numeral(claimableInKAI).format('0,0.00'),
      //   ),
      //   'success',
      //   () => {
      //     setClaiming(false);
      //   },
      // );
    } catch (err) {
      console.error(err);
      // showModal(getLanguageString(language, 'GENERAL_ERROR'), 'error', () => {
      //   setClaiming(false);
      // });
    }
  };

  return (
    <Modal
      visible={visible}
      showCloseButton={false}
      onClose={onClose}
      contentStyle={{
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start',
        padding: 20,
        height: 500,
      }}>
      <View style={{width: '100%', marginBottom: 4}}>
        <Text style={{color: theme.mutedTextColor}}>Validator</Text>
      </View>
      <View
        style={[
          styles.validatorContainer,
          {
            backgroundColor: theme.backgroundColor,
          },
        ]}>
        <TextAvatar
          text={validatorItem.name}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          textStyle={{fontSize: 16}}
        />
        <View>
          <Text style={[styles.validatorName, {color: theme.textColor}]}>
            {validatorItem.name}
          </Text>
        </View>
      </View>
      <Divider style={{width: '100%'}} color="#60636C" />
      <View style={{width: '100%'}}>
        <View style={styles.dataContainer}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'COMMISSION_RATE')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {getSelectedCommission()}
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'TOTAL_STAKED_AMOUNT')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {getSelectedStakedAmount()}
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'CLAIMABLE')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {numeral(weiToKAI(validatorItem.claimableRewards)).format('0,0.00')}{' '}
            KAI
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'UNBONDED')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {numeral(weiToKAI(validatorItem.unbondedAmount)).format('0,0.00')}{' '}
            KAI
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'WITHDRAWABLE')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {numeral(weiToKAI(validatorItem.withdrawableAmount)).format(
              '0,0.00',
            )}{' '}
            KAI
          </Text>
        </View>
      </View>
      <Divider style={{width: '100%'}} color="#60636C" />
      <Button
        title={getLanguageString(language, 'CANCEL')}
        onPress={onClose}
        type="outline"
        style={{width: '100%'}}
      />
      <Button
        style={{width: '100%', marginVertical: 12}}
        loading={claiming}
        disabled={claiming || withdrawing}
        title={getLanguageString(language, 'CLAIM_REWARD')}
        type="primary"
        size="small"
        onPress={claimHandler}
      />
    </Modal>
  );
};
