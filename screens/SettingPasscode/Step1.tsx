/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {Text, View} from 'react-native';
import OtpInputs from 'react-native-otp-inputs';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';

const Step1 = ({onSubmit}: {onSubmit: (passcode: string) => void}) => {
  const language = useRecoilValue(languageAtom);
  const theme = useContext(ThemeContext);
  const [passcode, setPasscode] = useState('');
  return (
    <>
      <Text style={[styles.title, {color: theme.textColor}]}>
        {getLanguageString(language, 'NEW_PASSCODE')}
      </Text>
      <View style={{marginBottom: 40}}>
        <OtpInputs
          keyboardType="phone-pad"
          handleChange={setPasscode}
          numberOfInputs={4}
          autofillFromClipboard={false}
          style={styles.otpContainer}
          inputStyles={styles.otpInput}
        />
      </View>
      <View>
        <Button
          block
          title={getLanguageString(language, 'SAVE')}
          onPress={() => onSubmit && onSubmit(passcode)}
        />
      </View>
    </>
  );
};

export default Step1;
