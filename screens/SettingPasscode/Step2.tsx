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

const Step2 = ({
  step1Passcode,
  onConfirm,
}: {
  step1Passcode: string;
  onConfirm: () => void;
}) => {
  const language = useRecoilValue(languageAtom);
  const theme = useContext(ThemeContext);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (passcode !== step1Passcode) {
      setError(getLanguageString(language, 'CONFIRM_PASSCODE_NOT_MATCH'));
      return;
    }

    onConfirm();
  };

  return (
    <>
      <Text style={[styles.title, {color: theme.textColor}]}>
        {getLanguageString(language, 'CONFIRM_PASSCODE')}
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
        {error !== '' && (
          <Text
            style={{color: 'red', paddingHorizontal: 20, fontStyle: 'italic'}}>
            {error}
          </Text>
        )}
      </View>
      <View>
        <Button
          block
          title={getLanguageString(language, 'CONFIRM')}
          onPress={handleSubmit}
        />
      </View>
    </>
  );
};

export default Step2;
