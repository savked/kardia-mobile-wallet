/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import numeral from 'numeral';
import {Text, View} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';
import {weiToKAI} from '../../services/transaction/amount';
import IconButton from '../../components/IconButton';
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
        Number(stakedAmountInKAI) - _undelegateValue < 25000 &&
        Number(stakedAmountInKAI) - _undelegateValue > 0
      ) {
        setUndelegateError(
          getLanguageString(language, 'UNDELEGATE_AMOUNT_REMAIN_25000'),
        );
        setSubmitting(false);
        return;
      }
      if (Number(stakedAmountInKAI) - _undelegateValue > 25000) {
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
          <Button
            style={{marginRight: 12}}
            loading={claiming}
            disabled={claiming || undelegating || withDrawing}
            title={getLanguageString(language, 'CLAIM_REWARD')}
            type="primary"
            size="small"
            onPress={claimHandler}
          />
          {withDrawbleInKAI === '0' && (
            <Button
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
            placeholder="Amount to undelegate..."
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

  return (
    <View
      style={{
        padding: 15,
        height: showFull ? (undelegateError === '' ? 240 : 270) : 170,
        marginVertical: 12,
        backgroundColor: theme.secondaryColor,
        borderRadius: 7,
        // flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}>
        <View>
          <Text style={styles.validatorName}>
            {item.name} ({item.role})
          </Text>
          <Text>
            {getLanguageString(language, 'STAKED')}:{' '}
            <Text style={{fontWeight: 'bold'}}>
              {numeral(stakedAmountInKAI).format('0,0.00')}
            </Text>
          </Text>
          <Text>
            {getLanguageString(language, 'CLAIMABLE')}:{' '}
            <Text style={{fontWeight: 'bold'}}>
              {numeral(claimableInKAI).format('0,0.00')}
            </Text>
          </Text>
          <Text>
            {getLanguageString(language, 'UNBONDED')}:{' '}
            <Text style={{fontWeight: 'bold'}}>
              {numeral(unbondedInKAI).format('0,0.00')}
            </Text>
          </Text>
          <Text>
            {getLanguageString(language, 'WITHDRAWABLE')}:{' '}
            <Text style={{fontWeight: 'bold'}}>
              {numeral(withDrawbleInKAI).format('0,0.00')}
            </Text>
          </Text>
        </View>
        <IconButton
          name={showFull ? 'chevron-up' : 'chevron-down'}
          size={22}
          style={{
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setShowFull(!showFull)}
        />
      </View>
      {showFull && renderActionGroup()}
    </View>
  );
};

export default StakingItem;
