import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Keyboard, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import Button from '../../../components/Button';
import Divider from '../../../components/Divider';
import Modal from '../../../components/Modal';
import CustomTextInput from '../../../components/TextInput';
import { MIN_DELEGATE } from '../../../config';
import { undelegateAll, undelegateWithAmount } from '../../../services/staking';
import { weiToKAI } from '../../../services/transaction/amount';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';
import { getSelectedWallet, getWallets } from '../../../utils/local';
import { format, formatNumberString, getDigit, isNumber } from '../../../utils/number';
import CustomText from '../../../components/Text';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import { pendingTxSelector } from '../../../atoms/pendingTx';

export default ({visible, onClose, validatorItem, onSuccess}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  validatorItem: any;
}) => {
  const navigation = useNavigation();
  const stakedAmountInKAI = weiToKAI(validatorItem.stakedAmount);

  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const [undelegateAmount, setUndelegateAmount] = useState('');
  const [undelegateError, setUndelegateError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)
  const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallets[selectedWallet].address))

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

  const handleClose = () => {
    if (submitting) {
      return;
    }
    onClose();
  }

  const handleUndelegate = async () => {
    if (pendingTx) {
      Alert.alert(getLanguageString(language, 'HAS_PENDING_TX'));
      return
    }
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
          getLanguageString(language, 'UNDELEGATE_AMOUNT_REMAIN_MIN').replace('{{MIN_KAI}}', formatNumberString(MIN_DELEGATE.toString())),
        );
        setSubmitting(false);
        return;
      }

      const localWallets = await getWallets();
      const localSelectedWallet = await getSelectedWallet();
      const _wallet = localWallets[localSelectedWallet];

      let rs

      if (Number(stakedAmountInKAI) - _undelegateValue > MIN_DELEGATE) {
        rs = await undelegateWithAmount(validatorItem.value, _undelegateValue, _wallet);
      } else {
        rs = await undelegateAll(validatorItem.value, _wallet);
      }
      setSubmitting(false);
      setUndelegateAmount('');
      setPendingTx(rs)
      navigation.navigate('SuccessTx', {
        type: 'undelegate',
        txHash: rs,
        validatorItem: validatorItem,
        undelegateAmount: _undelegateValue,
      });
      onSuccess();
    } catch (err) {
      setSubmitting(false);
      console.error(err);
      setUndelegateError(getLanguageString(language, 'GENERAL_ERROR'));
    }
  }

  const getModalStyle = () => {
    if (Platform.OS === 'android') {
      return {
        height: 340,
        backgroundColor: theme.backgroundFocusColor,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 0,
      };
    } else {
      return {
        height: 320,
        justifyContent: 'flex-start',
        backgroundColor: theme.backgroundFocusColor,
        alignItems: 'center',
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
        padding: 0,
      };
    }
  };

  return (
    <Modal showCloseButton={false} visible={visible} onClose={handleClose} contentStyle={getModalStyle()}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{flex: 1, width: '100%', padding: 35}}>
          <View style={{width: '100%'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
              <CustomText style={{fontSize: theme.defaultFontSize + 1, color: theme.textColor}} allowFontScaling={false}>
                {getLanguageString(
                  language,
                  'UNDELEGATE_AMOUNT_PLACEHOLDER',
                )}
              </CustomText>
              <TouchableOpacity onPress={() => setUndelegateAmount(formatNumberString(stakedAmountInKAI))}>
                <CustomText style={{fontSize: theme.defaultFontSize + 1, color: theme.urlColor}} allowFontScaling={false}>{formatNumberString(stakedAmountInKAI, 6)} KAI</CustomText>
              </TouchableOpacity>
            </View>
            <CustomTextInput
              keyboardType="numeric"
              message={undelegateError}
              inputStyle={{
                backgroundColor: 'rgba(96, 99, 108, 1)',
                color: theme.textColor,
              }}
              onChangeText={(newAmount) => {
                const digitOnly = getDigit(newAmount);
                if (Number(digitOnly) > Number(stakedAmountInKAI)) {
                  return;
                }
                if (digitOnly === '') {
                  setUndelegateAmount('0');
                  return;
                }
                if (isNumber(digitOnly)) {
                  let formatedValue = format((Number(digitOnly)));
                  if (newAmount[newAmount.length - 1] === '.') formatedValue += '.'
                  setUndelegateAmount(formatedValue);
                }
                // isNumber(digitOnly) && setUndelegateAmount(digitOnly);
              }}
              onBlur={() => {
                setUndelegateAmount(format(Number(getDigit(undelegateAmount))));
              }}
              value={undelegateAmount}
              autoFocus={true}
              // headline={getLanguageString(
              //   language,
              //   'UNDELEGATE_AMOUNT_PLACEHOLDER',
              // )}
            />
          </View>
          <Divider style={{width: '100%'}} />
          <Button
            disabled={submitting}
            title={getLanguageString(language, 'CANCEL')}
            onPress={handleClose}
            type="outline"
            style={{width: '100%', marginTop: 14}}
          />
          <Button
            loading={submitting}
            disabled={submitting}
            title={getLanguageString(language, 'UNDELEGATE')}
            onPress={handleUndelegate}
            style={{marginTop: 8}}
            textStyle={{
              fontWeight: '500',
              fontSize: theme.defaultFontSize + 3,
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};