/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Keyboard, Platform, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import CustomModal from '../../components/Modal';
import CustomTextInput from '../../components/TextInput';
import numeral from 'numeral';
import {MIN_DELEGATE} from '../../config';
import {undelegateAll, undelegateWithAmount} from '../../services/staking';
import {weiToKAI} from '../../services/transaction/amount';
import {getLanguageString} from '../../utils/lang';
import {getSelectedWallet, getWallets} from '../../utils/local';
import {format, getDigit, isNumber} from '../../utils/number';
import Button from '../../components/Button';

const UndelegateModal = ({
  item,
  visible,
  onClose,
  showModal,
}: {
  item: any;
  visible: boolean;
  onClose: () => void;
  showModal: (
    message: string,
    messageType: string,
    callback?: () => void,
  ) => void;
}) => {
  const [undelegateAmount, setUndelegateAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [undelegateError, setUndelegateError] = useState('');
  const stakedAmountInKAI = weiToKAI(item.stakedAmount);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const language = useRecoilValue(languageAtom);

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

      const localWallets = await getWallets();
      const localSelectedWallet = await getSelectedWallet();
      const _wallet = localWallets[localSelectedWallet];

      if (Number(stakedAmountInKAI) - _undelegateValue > MIN_DELEGATE) {
        await undelegateWithAmount(item.value, _undelegateValue, _wallet);
      } else {
        await undelegateAll(item.value, _wallet);
      }
      setSubmitting(false);
      setUndelegateAmount('');
      showModal(
        getLanguageString(language, 'UNDELEGATE_SUCCESS').replace(
          /{{KAI_AMOUNT}}/g,
          numeral(_undelegateValue).format('0,0.00'),
        ),
        'success',
      );
    } catch (err) {
      console.error(err);
      showModal(getLanguageString(language, 'GENERAL_ERROR'), 'error', () => {
        setUndelegateAmount('');
        setSubmitting(false);
      });
    }
  };

  const getContentStyle = () => {
    if (Platform.OS === 'android') {
      return {flex: keyboardShown ? 0.3 : 0.2};
    } else {
      return {
        flex: 0.2,
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
      };
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={() => {
        if (!submitting) {
          setUndelegateAmount('');
          setUndelegateError('');
          setSubmitting(false);
          onClose();
        }
      }}
      contentStyle={getContentStyle() as any}>
      <View>
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
          onBlur={() => {
            setUndelegateAmount(format(Number(undelegateAmount)));
          }}
          value={undelegateAmount}
          block
          headline={getLanguageString(
            language,
            'UNDELEGATE_AMOUNT_PLACEHOLDER',
          )}
          headlineStyle={{color: '#000000'}}
        />
      </View>
      <View
        style={{
          flex: 1,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Button
          block
          loading={submitting}
          disabled={submitting}
          size="large"
          title={getLanguageString(language, 'UNDELEGATE')}
          type="primary"
          onPress={submitUndelegate}
        />
      </View>
    </CustomModal>
  );
};

export default UndelegateModal;
