/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View} from 'react-native';
import Divider from '../../../components/Divider';
import Modal from '../../../components/Modal';
import TextAvatar from '../../../components/TextAvatar';
import {ThemeContext} from '../../../ThemeContext';
import {getLanguageString, parseError} from '../../../utils/lang';
import numeral from 'numeral';
import {styles} from './style';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import {weiToKAI} from '../../../services/transaction/amount';
import Button from '../../../components/Button';
import {getSelectedWallet, getWallets} from '../../../utils/local';
import {getAllValidator, withdrawDelegatedAmount, withdrawReward} from '../../../services/staking';
import { useNavigation } from '@react-navigation/native';
import UndelegateModal from '../UndelegateModal';
import CustomText from '../../../components/Text';
import { getLatestBlock } from '../../../services/blockchain';
import { formatNumberString, getDigit } from '../../../utils/number';
import { BLOCK_TIME } from '../../../config';

const showButton = (value: any) => {
  return numeral(value).format('0,0.00') !== '0.00'
}

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
  const [totalStakedAmount, setTotalStakedAmount] = useState('');
  const [estimatedAPR, setEstimatedAPR] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const {totalStaked} = await getAllValidator();
        setTotalStakedAmount(totalStaked);
        // setValidatorList(validators);
        // setLoading(false);
      } catch (error) {
        console.error(error);
        // setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    calculateStakingAPR();
  }, [totalStakedAmount]);

  const getSelectedCommission = () => {
    const formatted = numeral(validatorItem.commissionRate).format('0,0.00');
    return formatted === 'NaN' ? '0 %' : `${formatted} %`;
  };

  const getSelectedStakedAmount = (fragtionCount?: number) => {
    return `${formatNumberString(weiToKAI(validatorItem.stakedAmount), fragtionCount)} KAI`
    // const formatted = numeral(weiToKAI(validatorItem.stakedAmount)).format(
    //   '0,0.00',
    // );
    // return formatted === 'NaN' ? '0 KAI' : `${formatted} KAI`;
  };

  const handleClose = () => {
    if (claiming || withdrawing) {
      return;
    }
    onClose();
  }

  const calculateStakingAPR = async () => {
    if (!validatorItem || !totalStakedAmount) {
      return;
    }
    try {
      const commission = Number(validatorItem.commissionRate) / 100;
      const votingPower = Number(weiToKAI(validatorItem.stakedAmount)) / Number(weiToKAI(totalStakedAmount));

      const block = await getLatestBlock();
      const blockReward = Number(weiToKAI(block.rewards));
      const delegatorsReward = blockReward * (1 - commission) * votingPower;

      const yourReward =
        (Number(getDigit(getSelectedStakedAmount())) / Number(weiToKAI(validatorItem.stakedAmount))) * delegatorsReward;
      // setEstimatedProfit(`${(yourReward * (30 * 24 * 3600)) / BLOCK_TIME}`);
      setEstimatedAPR(
        `${
          ((yourReward * (365 * 24 * 3600)) /
            BLOCK_TIME /
            Number(getDigit(getSelectedStakedAmount()))) *
          100
        }`,
      );
    } catch (error) {
      console.error(error);
    }
  };

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
          txHash: rs,
          validatorItem: validatorItem,
          claimAmount: weiToKAI(validatorItem.claimableRewards),
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
      setClaiming(false);
      if (err.message) {
        Alert.alert(parseError(err.message, language));
      } else {
        Alert.alert(getLanguageString(language, 'GENERAL_ERROR'));
      }
    }
  };

  const withdrawHandler = async () => {
    try {
      setWithdrawing(true);
      const wallets = await getWallets();
      const selectedWallet = await getSelectedWallet();
      const rs = await withdrawDelegatedAmount(validatorItem.value, wallets[selectedWallet]);
      setWithdrawing(false);
      navigation.navigate('Transaction', {
        screen: 'SuccessTx',
        params: {
          type: 'withdraw',
          txHash: rs,
          validatorItem: validatorItem,
          withdrawAmount: weiToKAI(validatorItem.withdrawableAmount),
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
      setWithdrawing(false);
      if (err.message) {
        Alert.alert(parseError(err.message, language));
      } else {
        Alert.alert(getLanguageString(language, 'GENERAL_ERROR'));
      }
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

  const getModalHeight = () => {
    let height = Platform.OS === 'android' ? 530 : 500;
    if (showButton(validatorItem.withdrawableAmount)) {
      height += 12
    }
    if (showButton(validatorItem.claimableRewards)) {
      height += 12
    }
    if (showButton(validatorItem.stakedAmount)) {
      height += 12
    }
    return height
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
        height: getModalHeight(),
      }}>
      <View style={{width: '100%', marginBottom: 4}}>
        <CustomText style={{color: theme.mutedTextColor}}>Validator</CustomText>
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
          <CustomText style={[styles.validatorName, {color: theme.textColor}]}>
            {validatorItem.name}
          </CustomText>
        </View>
      </View>
      <Divider style={{width: '100%'}} color="#60636C" />
      <View style={{width: '100%'}}>
        <View style={styles.dataContainer}>
          <CustomText style={{color: theme.mutedTextColor}}>
            {getLanguageString(language, 'ESTIMATED_APR')}
          </CustomText>
          <CustomText style={[{color: theme.textColor, fontWeight: '500'}]}>
            {numeral(estimatedAPR).format('0,0.00')}{' '}%
          </CustomText>
        </View>
        <View style={styles.dataContainer}>
          <CustomText style={{color: theme.mutedTextColor}}>
            {getLanguageString(language, 'COMMISSION_RATE')}
          </CustomText>
          <CustomText style={[{color: theme.textColor, fontWeight: '500'}]}>
            {getSelectedCommission()}
          </CustomText>
        </View>
        <View style={styles.dataContainer}>
          <CustomText style={{color: theme.mutedTextColor}}>
            {getLanguageString(language, 'TOTAL_STAKED_AMOUNT')}
          </CustomText>
          <CustomText style={[{color: theme.textColor, fontWeight: '500'}]}>
            {getSelectedStakedAmount(6)}
          </CustomText>
        </View>
        {showButton(validatorItem.stakedAmount) && (
          <View style={[styles.dataContainer, {justifyContent: 'flex-end'}]}>
            <TouchableOpacity onPress={() => setShowUndelegateModal(true)}>
              <CustomText style={[{color: theme.urlColor}]}>
                {getLanguageString(language, 'UNDELEGATE')}
              </CustomText>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.dataContainer}>
          <CustomText style={{color: theme.mutedTextColor}}>
            {getLanguageString(language, 'CLAIMABLE')}
          </CustomText>
          <CustomText style={[{color: theme.textColor, fontWeight: '500'}]}>
            {formatNumberString(weiToKAI(validatorItem.claimableRewards), 6)}{' '}
            KAI
          </CustomText>
        </View>
        <View style={[styles.dataContainer, {justifyContent: 'flex-end'}]}>
          {showButton(weiToKAI(validatorItem.claimableRewards)) && (
            claiming ? (
              <ActivityIndicator color={theme.textColor} size="small" />
            ) : (
              <TouchableOpacity onPress={claimHandler}>
                <CustomText style={[{color: theme.urlColor}]}>
                  {getLanguageString(language, 'CLAIM_REWARD')}
                </CustomText>
              </TouchableOpacity>
            )
          )}
        </View>
        <View style={styles.dataContainer}>
          <CustomText style={{color: theme.mutedTextColor}}>
            {getLanguageString(language, 'UNBONDED')}
          </CustomText>
          <CustomText style={[{color: theme.textColor, fontWeight: '500'}]}>
            {numeral(weiToKAI(validatorItem.unbondedAmount)).format('0,0.00')}{' '}
            KAI
          </CustomText>
        </View>
        <View style={styles.dataContainer}>
          <CustomText style={{color: theme.mutedTextColor}}>
            {getLanguageString(language, 'WITHDRAWABLE')}
          </CustomText>
          <CustomText style={[{color: theme.textColor, fontWeight: '500'}]}>
            {numeral(weiToKAI(validatorItem.withdrawableAmount)).format(
              '0,0.00',
            )}{' '}
            KAI
          </CustomText>
        </View>
        {showButton(validatorItem.withdrawableAmount) && (
          <View style={[styles.dataContainer, {justifyContent: 'flex-end'}]}>
            {withdrawing ? (
              <ActivityIndicator color={theme.textColor} size="small" />
            ) : (
              <TouchableOpacity onPress={withdrawHandler}>
                <CustomText style={[{color: theme.urlColor}]}>
                  {getLanguageString(language, 'WITHDRAW')}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <Divider style={{width: '100%'}} color="#60636C" />
      {/* {showWithdraw(validatorItem.withdrawableAmount) && (
        <Button
          loading={withdrawing}
          disabled={withdrawing}
          title={getLanguageString(language, 'WITHDRAW')}
          onPress={withdrawHandler}
          type="outline"
          style={{width: '100%', marginBottom: 12}}
        />
      )} */}
      {/* <Button
        style={{width: '100%', marginBottom: 12}}
        loading={claiming}
        disabled={claiming || withdrawing}
        title={getLanguageString(language, 'CLAIM_REWARD')}
        type="outline"
        size="small"
        onPress={claimHandler}
      /> */}
      <Button
        title={getLanguageString(language, 'OK_TEXT')}
        onPress={handleClose}
        // type="outline"
        style={{width: '100%', marginBottom: 12}}
        textStyle={{
          fontWeight: '500',
          fontSize: theme.defaultFontSize + 4,
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
        }}
      />
      {/* <Button
        title={getLanguageString(language, 'UNDELEGATE')}
        onPress={() => setShowUndelegateModal(true)}
        type="secondary"
        style={{width: '100%', marginVertical: 12}}
      /> */}
    </Modal>
  );
};
