/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Image, Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import OtpInputs, { OtpInputsRef } from 'react-native-otp-inputs';
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
import Divider from '../../components/Divider';
import CustomText from '../../components/Text';

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
  const [touchType, setTouchType] = useState('');
  const setLocalAuth = useSetRecoilState(localAuthAtom);

  const otpRef = useRef<OtpInputsRef>(null)

  const focusOTP = useCallback(() => {
    if (otpRef && otpRef.current && touchSupported) {
      otpRef.current.focus();
    } else {
      Keyboard.dismiss()
    }
  }, [touchSupported])

  const clearOTP = useCallback(() => {
    if (otpRef && otpRef.current) {
      otpRef.current.reset();
    }
  }, [])

  useEffect(() => {
    focusOTP()
    TouchID.isSupported(optionalConfigObject)
      .then((biometryType) => {
        // Success code
        if (biometryType === 'FaceID') {
          setTouchType(biometryType);
        } else {
          setTouchType('TouchID');
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
      setError(getLanguageString(language, 'WRONG_PIN'));
      return;
    }
    Keyboard.dismiss()
    setPasscode('')
    clearOTP()
    setLocalAuth(true);
  };

  const authByTouchID = async () => {
    TouchID.authenticate('Use touch ID to access wallet', optionalConfigObject)
      .then(async () => {
        Keyboard.dismiss()
        setPasscode('')
        clearOTP()
        setLocalAuth(true);
      })
      .catch((err: any) => {
        // Failure code
        console.log(err);
      });
  };

  useEffect(() => {
    if (touchSupported) {
      authByTouchID()
    }
  }, [touchSupported])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <CustomText style={[styles.title, {color: theme.textColor}]}>
          {getLanguageString(language, 'ENTER_PIN_CODE')}
        </CustomText>
        <View style={{marginVertical: 24, width: '100%'}}>
          <OtpInputs
            // TODO: remove ts-ignore after issue fixed
            // @ts-ignore
            keyboardType="decimal-pad"
            handleChange={setPasscode}
            numberOfInputs={4}
            autofillFromClipboard={false}
            style={styles.otpContainer}
            inputStyles={{
              ...styles.otpInput,
              ...{backgroundColor: theme.backgroundFocusColor, color: theme.textColor},
            }}
            secureTextEntry={true}
            ref={otpRef}
          />
          {error !== '' && (
            <CustomText
              allowFontScaling={false}
              style={{color: 'red', paddingHorizontal: 20, fontStyle: 'italic'}}>
              {error}
            </CustomText>
          )}
        </View>
        <Divider style={{width: 32, backgroundColor: '#F0F1F2'}} />
        {touchSupported && (
          <TouchableOpacity
            onPress={authByTouchID}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 20,
            }}>
            {touchType === 'FaceID' ? (
              <Image
                style={{width: 30, height: 30, marginRight: 8}}
                source={require('../../assets/icon/face_id_dark.png')}
              />
            ) : (
              <Icon name="finger-print" color={theme.textColor} size={30} />
            )}
            <CustomText style={{color: theme.textColor}}>
              Authenticate by {touchType}
            </CustomText>
          </TouchableOpacity>
        )}
        <Button
          block
          title={getLanguageString(language, 'CONFIRM')}
          onPress={handleSubmit}
          textStyle={{
            fontSize: theme.defaultFontSize + 4,
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ConfirmPasscode;
