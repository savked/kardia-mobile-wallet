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
import { useNavigation } from '@react-navigation/native';
import UndelegateModal from '../UndelegateModal';

export default ({
  validatorItem,
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
  validatorItem: any;
}) => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const [claiming, setClaiming] = useState(false);
  const [showUndelegateModal, setShowUndelegateModal] = useState(false);
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

  const handleClose = () => {
    if (claiming || withdrawing) {
      return;
    }
    onClose();
  }

  const claimHandler = async () => {
    try {
      setClaiming(true);
      const wallets = await getWallets();
      const selectedWallet = await getSelectedWallet();
      const rs = await withdrawReward(validatorItem.value, wallets[selectedWallet]);
      setClaiming(false);
      navigation.navigate('Transaction', {
        screen: 'SuccessTx',
        params: {
          type: 'claim',
          txHash: rs.transactionHash,
          validatorItem: validatorItem,
          claimAmount: weiToKAI(validatorItem.claimableRewards),
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
      // showModal(getLanguageString(language, 'GENERAL_ERROR'), 'error', () => {
      //   setClaiming(false);
      // });
    }
  };

  if (!visible) {
    return null;
  }

  if (showUndelegateModal) {
    return (
      <UndelegateModal
        visible={showUndelegateModal}
        onClose={() => {
          setShowUndelegateModal(false);
        }}
        onSuccess={() => {
          // setShowUndelegateModal(false);
          onClose();
        }}
        validatorItem={validatorItem}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      showCloseButton={false}
      onClose={handleClose}
      contentStyle={{
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start',
        padding: 20,
        height: 500,
      }}>
      <View style={{width: '100%', marginBottom: 4}}>
        <Text allowFontScaling={false} style={{color: theme.mutedTextColor}}>Validator</Text>
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
          <Text allowFontScaling={false} style={[styles.validatorName, {color: theme.textColor}]}>
            {validatorItem.name}
          </Text>
        </View>
      </View>
      <Divider style={{width: '100%'}} color="#60636C" />
      <View style={{width: '100%'}}>
        <View style={styles.dataContainer}>
          <Text allowFontScaling={false} style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'COMMISSION_RATE')}
          </Text>
          <Text allowFontScaling={false} style={[{color: theme.textColor}]}>
            {getSelectedCommission()}
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text allowFontScaling={false} style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'TOTAL_STAKED_AMOUNT')}
          </Text>
          <Text allowFontScaling={false} style={[{color: theme.textColor}]}>
            {getSelectedStakedAmount()}
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text allowFontScaling={false} style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'CLAIMABLE')}
          </Text>
          <Text allowFontScaling={false} style={[{color: theme.textColor}]}>
            {numeral(weiToKAI(validatorItem.claimableRewards)).format('0,0.00')}{' '}
            KAI
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text allowFontScaling={false} style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'UNBONDED')}
          </Text>
          <Text allowFontScaling={false} style={[{color: theme.textColor}]}>
            {numeral(weiToKAI(validatorItem.unbondedAmount)).format('0,0.00')}{' '}
            KAI
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <Text allowFontScaling={false} style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'WITHDRAWABLE')}
          </Text>
          <Text allowFontScaling={false} style={[{color: theme.textColor}]}>
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
        onPress={handleClose}
        type="outline"
        style={{width: '100%'}}
      />
      <Button
        title={getLanguageString(language, 'UNDELEGATE')}
        onPress={() => setShowUndelegateModal(true)}
        type="secondary"
        style={{width: '100%', marginVertical: 12}}
      />
      <Button
        style={{width: '100%'}}
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
