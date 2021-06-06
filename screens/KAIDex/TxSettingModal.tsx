import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import Button from '../../components/Button';
import CustomModal from '../../components/Modal';
import Tags from '../../components/Tags';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getDigit } from '../../utils/number';

export default ({visible, onClose, onSubmit, deadline: _deadline, slippageTolerance: _slippageTolerance}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newTimeout: string, newSlippageTolerance: string) => void;
  deadline: string;
  slippageTolerance: string;
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [deadline, setDeadline] = useState(_deadline)
  const [errorDeadline, setErrorDeadline] = useState('')
  const [slippageTolerance, setSlippageTolerance] = useState(_slippageTolerance)
  const [errorSlippageTolerance, setErrorSlippageTolerance] = useState('')

  // const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    // setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    // setKeyboardShown(false);
  };

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

  const getContentStyle = () => {
    if (Platform.OS === 'android') {
      return {
        backgroundColor: theme.backgroundFocusColor,
        height: 420,
      }
    }
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 420,
      marginBottom: keyboardOffset
    }
  }

  const handleClose = () => {
    setDeadline(_deadline)
    setSlippageTolerance(_slippageTolerance)
    setErrorSlippageTolerance('')
    setErrorDeadline('')
    onClose();
  }

  const validate = () => {
    let isValid = true
    setErrorSlippageTolerance('');
    setErrorDeadline('')
    if (!getDigit(slippageTolerance) || getDigit(slippageTolerance).length === 0) {
      setErrorSlippageTolerance(getLanguageString(language, 'SLIPPAGE_ERROR'))
      isValid = false
    }
    if (Number(getDigit(slippageTolerance)) >= 100 || Number(getDigit(slippageTolerance)) <= 0) {
      setErrorSlippageTolerance(getLanguageString(language, 'SLIPPAGE_ERROR'))
      isValid = false
    }
    if (!getDigit(deadline) || getDigit(deadline).length === 0) {
      setErrorDeadline(getLanguageString(language, 'DEADLINE_ERROR'))
      isValid = false
    }
    if (Number(getDigit(deadline)) < 0) {
      setErrorDeadline(getLanguageString(language, 'DEADLINE_ERROR'))
      isValid = false
    }
    return isValid
  }

  return (
    <CustomModal
      showCloseButton={false}
      visible={visible}
      onClose={handleClose}
      contentStyle={getContentStyle()}
    >
      <View style={{width: '100%'}}>
        <View style={{width: '100%'}}>
          <CustomTextInput
            keyboardType="numeric"
            value={deadline}
            onChangeText={setDeadline}
            headline={`${getLanguageString(language, 'TX_DEADLINE')} (${getLanguageString(language, 'MINS')})`}
            headlineStyle={{
              fontWeight: 'normal',
            }}
            inputStyle={{
              backgroundColor: 'rgba(96, 99, 108, 1)',
              color: theme.textColor,
            }}
          />
          <View style={{flexDirection: 'row', marginTop: 12}}>
            <Tags content={`2 ${getLanguageString(language, 'MINS')}`} active={deadline === '2'} containerStyle={{marginRight: 12}} onPress={() => setDeadline('2')} />
            <Tags content={`5 ${getLanguageString(language, 'MINS')}`} active={deadline === '5'} containerStyle={{marginRight: 12}} onPress={() => setDeadline('5')} />
            <Tags content={`10 ${getLanguageString(language, 'MINS')}`} active={deadline === '10'} containerStyle={{marginRight: 12}} onPress={() => setDeadline('10')} />
            <Tags content={`15 ${getLanguageString(language, 'MINS')}`} active={deadline === '15'} onPress={() => setDeadline('15')} />
          </View>
          <CustomText
            style={{
              color: 'rgba(255, 66, 67, 1)',
              marginTop: errorDeadline ? 12 : 0,
              fontSize: theme.defaultFontSize + 1,
              textAlign: 'left',
              width: '100%'
            }}
          >
            {errorDeadline}
          </CustomText>
        </View>
        <View style={{width: '100%', marginTop: 18}}>
          <CustomTextInput
            keyboardType="numeric"
            value={slippageTolerance}
            onChangeText={setSlippageTolerance}
            headline={`${getLanguageString(language, 'SLIPPAGE_TOLERANCE')} (%)`}
            headlineStyle={{
              fontWeight: 'normal',
            }}
            inputStyle={{
              backgroundColor: 'rgba(96, 99, 108, 1)',
              color: theme.textColor,
            }}
          />
          <View style={{flexDirection: 'row', marginTop: 12}}>
            <Tags content={`1 %`} active={slippageTolerance === '1'} containerStyle={{marginRight: 12}} onPress={() => setSlippageTolerance('1')} />
            <Tags content={`2 %`} active={slippageTolerance === '2'} containerStyle={{marginRight: 12}} onPress={() => setSlippageTolerance('2')} />
            <Tags content={`5 %`} active={slippageTolerance === '5'} containerStyle={{marginRight: 12}} onPress={() => setSlippageTolerance('5')} />
            <Tags content={`10 %`} active={slippageTolerance === '10'} onPress={() => setSlippageTolerance('10')} />
          </View>
          <CustomText
            style={{
              color: 'rgba(255, 66, 67, 1)',
              marginTop: errorSlippageTolerance ? 12 : 0,
              fontSize: theme.defaultFontSize + 1,
              textAlign: 'left',
              width: '100%'
            }}
          >
            {errorSlippageTolerance}
          </CustomText>
        </View>
      </View>
      <Button
        title={getLanguageString(language, 'CONFIRM')}
        onPress={() => {
          if (validate()) {
            onSubmit(deadline, slippageTolerance)
          }
        }}
        style={{marginBottom: 40}}
        textStyle={{
          fontWeight: '500',
          fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
        }}
      />
    </CustomModal>
  );
};