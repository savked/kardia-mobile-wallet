/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import OtpInputs from 'react-native-otp-inputs';
import TouchID from 'react-native-touch-id';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {getAppPasscode} from '../../utils/local';
import {styles} from './style';
import {localAuthAtom} from '../../atoms/localAuth';

const optionalConfigObject = {
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // if true is passed, itwill allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
};

const ConfirmPasscode = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [touchSupported, setTouchSupported] = useState(false);
  const setLocalAuth = useSetRecoilState(localAuthAtom);

  useEffect(() => {
    TouchID.isSupported(optionalConfigObject)
      .then((biometryType) => {
        // Success code
        if (biometryType === 'FaceID') {
          console.log('FaceID is supported.');
        } else {
          console.log('TouchID is supported.');
        }
        setTouchSupported(true);
      })
      .catch((err: any) => {
        // Failure code
        console.log(err);
      });
  }, []);

  const handleSubmit = async () => {
    const localPass = await getAppPasscode();
    if (localPass !== passcode) {
      setError('Wrong passcode');
      return;
    }
    await setLocalAuth(true);
  };

  const authByTouchID = async () => {
    TouchID.authenticate('Use touch ID to access wallet', optionalConfigObject)
      .then(async () => {
        await setLocalAuth(true);
      })
      .catch((err: any) => {
        // Failure code
        console.log(err);
      });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <Text style={[styles.title, {color: theme.textColor}]}>
        {getLanguageString(language, 'ENTER_PASSCODE')}
      </Text>
      <View style={{marginBottom: 40}}>
        <OtpInputs
          // TODO: remove ts-ignore after issue fixed
          // @ts-ignore
          keyboardType="decimal-pad"
          handleChange={setPasscode}
          numberOfInputs={4}
          autofillFromClipboard={false}
          style={styles.otpContainer}
          inputStyles={styles.otpInput}
          secureTextEntry={true}
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
      {touchSupported && (
        <View>
          <TouchableOpacity
            onPress={authByTouchID}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 20,
            }}>
            <Icon name="finger-print" color={theme.textColor} size={30} />
            <Text style={{color: theme.textColor}}>
              Authenticate by Touch ID
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ConfirmPasscode;
