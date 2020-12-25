/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {Text, View} from 'react-native';
import OtpInputs from 'react-native-otp-inputs';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {getAppPasscode} from '../../utils/local';
import {styles} from './style';

const ConfirmPasscode = ({onSuccess}: {onSuccess: () => void}) => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const localPass = await getAppPasscode();
    if (localPass !== passcode) {
      setError('Wrong passcode');
      return;
    }
    onSuccess();
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Text style={[styles.title, {color: theme.textColor}]}>
        {getLanguageString(language, 'ENTER_PASSCODE')}
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
    </View>
  );
};

export default ConfirmPasscode;
