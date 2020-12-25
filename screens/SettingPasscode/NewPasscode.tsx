import {useNavigation} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {View} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import {saveAppPasscode} from '../../utils/local';
import Step1 from './Step1';
import Step2 from './Step2';
import {styles} from './style';

const NewPasscode = () => {
  const theme = useContext(ThemeContext);
  const [passcode, setPasscode] = useState('');
  const [step, setStep] = useState(1);
  const navigation = useNavigation();

  const savePasscode = async () => {
    await saveAppPasscode(passcode);
    setStep(1);
    navigation.navigate('Setting');
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {step === 1 ? (
        <Step1
          onSubmit={(newPasscode) => {
            setPasscode(newPasscode);
            setStep(2);
          }}
        />
      ) : (
        <Step2 step1Passcode={passcode} onConfirm={savePasscode} />
      )}
    </View>
  );
};

export default NewPasscode;
