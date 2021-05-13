import React, { useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import Button from '../../components/Button';
import CustomModal from '../../components/Modal';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';

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
  const [slippageTolerance, setSlippageTolerance] = useState(_slippageTolerance)

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
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 350,
      marginBottom: keyboardOffset
    }
  }

  const handleClose = () => {
    setDeadline(_deadline)
    setSlippageTolerance(_slippageTolerance)
    onClose();
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
            value={deadline}
            onChangeText={setDeadline}
            headline={'Transaction deadline (mins)'}
            headlineStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        </View>
        <View style={{width: '100%', marginTop: 18}}>
          <CustomTextInput
            value={slippageTolerance}
            onChangeText={setSlippageTolerance}
            headline={'Slippage tolerance (%)'}
            headlineStyle={{
              fontWeight: '500',
              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
            }}
          />
        </View>
      </View>
      <Button
        title={getLanguageString(language, 'CONFIRM')}
        onPress={() => {
          onSubmit(deadline, slippageTolerance)
        }}
        style={{marginBottom: 40}}
      />
    </CustomModal>
  );
};