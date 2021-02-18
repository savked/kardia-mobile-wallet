/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import numeral from 'numeral';
import {Text, TouchableOpacity, View} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';
import {weiToKAI} from '../../services/transaction/amount';
import IconButton from '../../components/IconButton';
import Icon from 'react-native-vector-icons/Feather';
import Button from '../../components/Button';
import {
  undelegateAll,
  undelegateWithAmount,
  withdrawDelegatedAmount,
  withdrawReward,
} from '../../services/staking';
import {useRecoilValue} from 'recoil';
import {format, getDigit, isNumber} from '../../utils/number';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
import CustomTextInput from '../../components/TextInput';
import {MIN_DELEGATE} from '../../config';

const StakingItem = ({
  item,
  showModal,
}: {
  item: any;
  showModal: (
    message: string,
    messageType: string,
    callback: () => void,
  ) => void;
}) => {
  const [showFull, setShowFull] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [undelegating, setUndelegating] = useState(false);
  const [withDrawing, setWithDrawing] = useState(false);
  const [undelegateAmount, setUndelegateAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [undelegateError, setUndelegateError] = useState('');
  const theme = useContext(ThemeContext);

  const claimableInKAI = weiToKAI(item.claimableRewards);
  const withDrawbleInKAI = weiToKAI(item.withdrawableAmount);
  const unbondedInKAI = weiToKAI(item.unbondedAmount);
  const stakedAmountInKAI = weiToKAI(item.stakedAmount);

  const language = useRecoilValue(languageAtom);
  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);

  const claimHandler = async () => {
    try {
      setClaiming(true);
      await withdrawReward(item.value, wallets[selectedWallet]);
      showModal(
        getLanguageString(language, 'CLAIM_SUCCESS').replace(
          '{{KAI_AMOUNT}}',
          numeral(claimableInKAI).format('0,0.00'),
        ),
        'success',
        () => {
          setClaiming(false);
        },
      );
    } catch (err) {
      console.error(err);
      showModal(getLanguageString(language, 'GENERAL_ERROR'), 'error', () => {
        setClaiming(false);
      });
    }
  };

  const undelegateHandler = () => {
    try {
      setUndelegating(true);
    } catch (error) {}
  };

  const withdrawHandler = async () => {
    try {
      setWithDrawing(true);
      await withdrawDelegatedAmount(item.value, wallets[selectedWallet]);
      showModal(
        getLanguageString(language, 'WITHDRAW_SUCCESS').replace(
          '{{KAI_AMOUNT}}',
          numeral(withDrawbleInKAI).format('0,0.00'),
        ),
        'success',
        () => {
          setWithDrawing(false);
        },
      );
    } catch (err) {
      console.error(err);
      showModal(getLanguageString(language, 'GENERAL_ERROR'), 'error', () => {
        setWithDrawing(false);
      });
    }
  };

  const submitUndelegate = async () => {
    try {
      setSubmitting(true);
      const _undelegateValue = Number(getDigit(undelegateAmount));
      if (Number(stakedAmountInKAI) < _undelegateValue) {
        setUndelegateError(
          getLanguageString(language, 'UNDELEGATE_AMOUNT_TOO_MUCH'),
        );
        setSubmitting(false);
        return;
      }
      if (
        Number(stakedAmountInKAI) - _undelegateValue < MIN_DELEGATE &&
        Number(stakedAmountInKAI) - _undelegateValue > 0
      ) {
        setUndelegateError(
          getLanguageString(language, 'UNDELEGATE_AMOUNT_REMAIN_1000'),
        );
        setSubmitting(false);
        return;
      }
      if (Number(stakedAmountInKAI) - _undelegateValue > MIN_DELEGATE) {
        await undelegateWithAmount(
          item.value,
          _undelegateValue,
          wallets[selectedWallet],
        );
      } else {
        await undelegateAll(item.value, wallets[selectedWallet]);
      }
      showModal(
        getLanguageString(language, 'UNDELEGATE_SUCCESS').replace(
          '{{KAI_AMOUNT}}',
          numeral(_undelegateValue).format('0,0.00'),
        ),
        'success',
        () => {
          setUndelegateAmount('');
          setUndelegating(false);
          setSubmitting(false);
        },
      );
    } catch (err) {
      console.error(err);
      showModal(getLanguageString(language, 'GENERAL_ERROR'), 'error', () => {
        setUndelegateAmount('');
        setSubmitting(false);
      });
    }
  };

  const renderActionGroup = () => {
    if (!undelegating) {
      return (
        <View style={styles.actionContainer}>
          {claimableInKAI !== '0' && (
            <Button
              style={{marginRight: 12, paddingVertical: 8}}
              loading={claiming}
              disabled={claiming || undelegating || withDrawing}
              title={getLanguageString(language, 'CLAIM_REWARD')}
              type="primary"
              size="small"
              onPress={claimHandler}
            />
          )}
          {stakedAmountInKAI !== '0' && (
            <Button
              style={{paddingVertical: 8}}
              title={getLanguageString(language, 'UNDELEGATE')}
              loading={undelegating}
              disabled={claiming || undelegating}
              type="ghost"
              size="small"
              onPress={undelegateHandler}
            />
          )}
          {withDrawbleInKAI !== '0' && (
            <Button
              style={{paddingVertical: 8}}
              title={getLanguageString(language, 'WITHDRAW')}
              loading={undelegating}
              disabled={claiming || undelegating}
              type="ghost"
              size="small"
              onPress={withdrawHandler}
            />
          )}
        </View>
      );
    }
    return (
      <View style={styles.actionContainer}>
        <View style={{flex: 2.4, paddingRight: 4}}>
          <CustomTextInput
            keyboardType="numeric"
            message={undelegateError}
            onChangeText={(newAmount) => {
              const digitOnly = getDigit(newAmount);
              if (Number(digitOnly) > Number(stakedAmountInKAI)) {
                return;
              }
              if (digitOnly === '') {
                setUndelegateAmount('0');
                return;
              }
              isNumber(digitOnly) && setUndelegateAmount(digitOnly);
            }}
            onBlur={() => setUndelegateAmount(format(Number(undelegateAmount)))}
            value={undelegateAmount}
            block
            placeholder={getLanguageString(
              language,
              'UNDELEGATE_AMOUNT_PLACEHOLDER',
            )}
          />
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}>
          <IconButton
            disabled={submitting}
            loading={submitting}
            style={{
              backgroundColor: theme.successColor,
              width: 42,
              height: 42,
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            name="check"
            color="#fff"
            size={20}
            onPress={submitUndelegate}
          />
          <IconButton
            disabled={submitting}
            style={{
              backgroundColor: theme.outlineBorderColor,
              width: 42,
              height: 42,
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            name="close"
            color="#fff"
            size={20}
            onPress={() => {
              setUndelegateAmount('');
              setUndelegateError('');
              setUndelegating(false);
            }}
          />
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (!showFull) {
      setUndelegateError('');
    }
  }, [showFull]);

  return (
    <View
      style={{
        padding: 15,
        // height: showFull ? (undelegateError === '' ? 240 : 270) : 120,
        marginVertical: 2,
        backgroundColor: theme.backgroundFocusColor,
        borderRadius: 7,
        // flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <TouchableOpacity
        onPress={() => setShowFull(!showFull)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}>
        <View style={{justifyContent: 'center'}}>
          <Text style={[styles.validatorName, {color: theme.textColor}]}>
            {item.name}
          </Text>
          {showFull && (
            <Text style={{color: '#929394'}}>
              {getLanguageString(language, 'STAKED')}:{' '}
              <Text style={{fontWeight: 'bold', color: theme.textColor}}>
                {numeral(stakedAmountInKAI).format('0,0.00')}
              </Text>
            </Text>
          )}
          {showFull && (
            <Text style={{color: '#929394'}}>
              {getLanguageString(language, 'CLAIMABLE')}:{' '}
              <Text style={{fontWeight: 'bold', color: theme.textColor}}>
                {numeral(claimableInKAI).format('0,0.00')}
              </Text>
            </Text>
          )}
          {showFull && (
            <Text style={{color: '#929394'}}>
              {getLanguageString(language, 'UNBONDED')}:{' '}
              <Text style={{fontWeight: 'bold', color: theme.textColor}}>
                {numeral(unbondedInKAI).format('0,0.00')}
              </Text>
            </Text>
          )}
          {showFull && (
            <Text style={{color: '#929394'}}>
              {getLanguageString(language, 'WITHDRAWABLE')}:{' '}
              <Text style={{fontWeight: 'bold', color: theme.textColor}}>
                {numeral(withDrawbleInKAI).format('0,0.00')}
              </Text>
            </Text>
          )}
        </View>
        <View style={{flexDirection: 'row'}}>
          {!showFull && (
            <View style={{justifyContent: 'center'}}>
              <Text style={{fontWeight: 'bold', color: theme.textColor}}>
                {numeral(claimableInKAI).format('0,0.00')} KAI
              </Text>
            </View>
          )}
          <Icon
            name={showFull ? 'chevron-up' : 'chevron-down'}
            size={22}
            color="#929394"
            style={{
              marginLeft: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setShowFull(!showFull)}
          />
        </View>
      </TouchableOpacity>
      {showFull && renderActionGroup()}
    </View>
  );
};

export default StakingItem;
