/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {Keyboard, Platform, Text, View} from 'react-native';
import numeral from 'numeral';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import Divider from '../../../components/Divider';
import Modal from '../../../components/Modal';
import TextAvatar from '../../../components/TextAvatar';
import TextInput from '../../../components/TextInput';
import {ThemeContext} from '../../../ThemeContext';
import {getLanguageString} from '../../../utils/lang';
import {getDigit, isNumber, format} from '../../../utils/number';
import {styles} from './style';
import {weiToKAI} from '../../../services/transaction/amount';
import Button from '../../../components/Button';
import {BLOCK_TIME, MIN_DELEGATE} from '../../../config';
import {getSelectedWallet, getWallets} from '../../../utils/local';
import {delegateAction, getAllValidator} from '../../../services/staking';
import {getLatestBlock} from '../../../services/blockchain';
import AuthModal from '../AuthModal';
import {useNavigation} from '@react-navigation/native';

export default ({
  validatorItem,
  visible,
  onClose,
}: {
  validatorItem?: Validator;
  visible: boolean;
  onClose: () => void;
}) => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const [amount, setAmount] = useState('0');
  const [amountError, setAmountError] = useState('');
  const [estimatedProfit, setEstimatedProfit] = useState('');
  const [estimatedAPR, setEstimatedAPR] = useState('');
  const [totalStakedAmount, setTotalStakedAmount] = useState('');
  const [delegating, setDelegating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const theme = useContext(ThemeContext);

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

  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardWillShow', _keyboardDidShow);
      Keyboard.addListener('keyboardWillHide', _keyboardDidHide);
    } else {
      Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    }

    // cleanup function
    return () => {
      if (Platform.OS === 'ios') {
        Keyboard.removeListener('keyboardWillShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardWillHide', _keyboardDidHide);
      } else {
        Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
      }
    };
  }, []);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false);
  };

  const resetState = () => {
    setAmount('0');
    setAmountError('');
    setEstimatedProfit('');
    setEstimatedAPR('');
    setShowAuthModal(false);
    setDelegating(false);
  };

  const calculateStakingAPR = async () => {
    if (!validatorItem) {
      return;
    }
    try {
      const newTotalStaked =
        Number(weiToKAI(totalStakedAmount)) + Number(getDigit(amount));
      const validatorNewTotalStaked =
        Number(weiToKAI(validatorItem.stakedAmount)) + Number(getDigit(amount));

      const commission = Number(validatorItem.commissionRate) / 100;
      const votingPower = validatorNewTotalStaked / newTotalStaked;

      const block = await getLatestBlock();
      const blockReward = Number(weiToKAI(block.rewards));
      const delegatorsReward = blockReward * (1 - commission) * votingPower;

      const yourReward =
        (Number(getDigit(amount)) / validatorNewTotalStaked) * delegatorsReward;

      setEstimatedProfit(`${(yourReward * (30 * 24 * 3600)) / BLOCK_TIME}`);
      setEstimatedAPR(
        `${
          ((yourReward * (365 * 24 * 3600)) /
            BLOCK_TIME /
            Number(getDigit(amount))) *
          100
        }`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (validatorItem && amount) {
      calculateStakingAPR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatorItem, amount]);

  if (!validatorItem) {
    return null;
  }

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

  const getSelectedVotingPower = () => {
    const formatted = numeral(validatorItem.votingPowerPercentage).format(
      '0,0.00',
    );
    return formatted === 'NaN' ? '0 %' : `${formatted} %`;
  };

  const validate = async () => {
    setAmountError('');

    if (Number(getDigit(amount)) < MIN_DELEGATE) {
      setAmountError(
        getLanguageString(language, 'AT_LEAST_MIN_DELEGATE').replace(
          '{{MIN_KAI}}',
          numeral(MIN_DELEGATE).format('0,0'),
        ),
      );
      return false;
    }

    const wallets = await getWallets();
    const selectedWallet = await getSelectedWallet();
    if (
      Number(getDigit(amount)) >
      Number(weiToKAI(wallets[selectedWallet].balance))
    ) {
      setAmountError(getLanguageString(language, 'STAKING_AMOUNT_NOT_ENOUGHT'));
      return false;
    }

    return true;
  };

  const delegateHandler = async () => {
    setAmountError('');
    try {
      if (Number(getDigit(amount)) < MIN_DELEGATE) {
        setAmountError(
          getLanguageString(language, 'AT_LEAST_MIN_DELEGATE').replace(
            '{{MIN_KAI}}',
            numeral(MIN_DELEGATE).format('0,0'),
          ),
        );
        return;
      }

      const wallets = await getWallets();
      const selectedWallet = await getSelectedWallet();

      if (
        Number(getDigit(amount)) >
        Number(weiToKAI(wallets[selectedWallet].balance))
      ) {
        setAmountError(
          getLanguageString(language, 'STAKING_AMOUNT_NOT_ENOUGHT'),
        );
        return;
      }
      setDelegating(true);
      const rs = await delegateAction(
        validatorItem.smcAddress,
        wallets[selectedWallet],
        Number(getDigit(amount)),
      );
      if (rs.status === 0) {
        console.log('Delegate Tx Fail ', rs.transactionHash);
        setDelegating(false);
      } else {
        setDelegating(false);
        navigation.navigate('Transaction', {
          screen: 'SuccessTx',
          params: {
            txHash: rs.transactionHash,
            type: 'delegate',
            validatorItem: validatorItem,
          },
        });
        resetState();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setDelegating(false);
    }
  };

  if (showAuthModal) {
    return (
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={delegateHandler}
      />
    );
  }

  const getModalStyle = () => {
    if (Platform.OS === 'android') {
      return {
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start',
        height: 530,
      };
    } else {
      return {
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start',
        height: 530,
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
      };
    }
  };

  return (
    <Modal
      visible={visible}
      showCloseButton={false}
      onClose={() => {
        resetState();
        onClose();
      }}
      contentStyle={getModalStyle()}>
      <View style={{width: '100%'}}>
        <TextInput
          message={amountError}
          headline={getLanguageString(language, 'STAKING_AMOUNT')}
          keyboardType="numeric"
          value={amount}
          onChangeText={(newAmount) => {
            const digitOnly = getDigit(newAmount);
            // if (Number(digitOnly) > wallets[selectedWallet].balance) {
            //   return;
            // }
            if (digitOnly === '') {
              setAmount('0');
              return;
            }
            isNumber(digitOnly) && setAmount(digitOnly);
          }}
          onBlur={() => setAmount(format(Number(amount)))}
        />
      </View>
      <View style={{width: '100%', marginTop: 12}}>
        <Text style={{color: theme.textColor}}>Validator</Text>
        <View
          style={[
            styles.validatorItemContainer,
            {
              backgroundColor: theme.backgroundColor,
            },
          ]}>
          <TextAvatar
            text={validatorItem.name}
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{fontSize: 16}}
          />
          <View style={{justifyContent: 'space-between'}}>
            <Text
              style={{
                color: theme.textColor,
                fontSize: 13,
                fontWeight: 'bold',
              }}>
              {validatorItem.name}
            </Text>
            <Text
              style={{
                color: 'rgba(252, 252, 252, 0.54)',
                fontSize: theme.defaultFontSize,
              }}>
              {validatorItem.commissionRate} %
            </Text>
          </View>
        </View>
      </View>
      <Divider style={{width: '100%', backgroundColor: '#60636C'}} />
      <View style={{width: '100%'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'COMMISSION_RATE')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {getSelectedCommission()}
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'TOTAL_STAKED_AMOUNT')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {getSelectedStakedAmount()}
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'VOTING_POWER')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {getSelectedVotingPower()}
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'ESTIMATED_EARNING')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {numeral(estimatedProfit).format('0,0.00')}{' '}
            {estimatedProfit ? 'KAI' : ''}
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: theme.textColor, fontStyle: 'italic'}}>
            {getLanguageString(language, 'ESTIMATED_APR')}
          </Text>
          <Text style={[{color: theme.textColor}]}>
            {numeral(estimatedAPR).format('0,0.00')}{' '}
            {estimatedProfit ? '%' : ''}
          </Text>
        </View>
      </View>
      <Divider style={{width: '100%', backgroundColor: '#60636C'}} />
      <View style={{width: '100%'}}>
        <Button
          type="outline"
          title={getLanguageString(language, 'GO_BACK')}
          onPress={() => {
            resetState();
            onClose();
          }}
          disabled={delegating}
          style={{marginBottom: 12, marginTop: 36}}
        />
        <Button
          loading={delegating}
          disabled={delegating}
          type="primary"
          title={getLanguageString(language, 'DELEGATE')}
          onPress={async () => {
            if (await validate()) {
              setShowAuthModal(true);
            }
          }}
          textStyle={{fontWeight: 'bold'}}
        />
      </View>
    </Modal>
  );
};
