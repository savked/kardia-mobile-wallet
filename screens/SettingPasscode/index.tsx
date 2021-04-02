/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Image, Text, TouchableOpacity, View} from 'react-native';
// import ToggleSwitch from 'toggle-switch-react-native';
import OtpInputs from 'react-native-otp-inputs';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {
  getAppPasscode,
  getAppPasscodeSetting,
  // saveAppPasscode,
  // saveAppPasscodeSetting,
} from '../../utils/local';
import NewPasscode from './NewPasscode';
import {styles} from './style';
import {localAuthEnabledAtom} from '../../atoms/localAuth';
import { useFocusEffect } from '@react-navigation/native';
import { showTabBarAtom } from '../../atoms/showTabBar';
import Divider from '../../components/Divider';
import TouchID from 'react-native-touch-id';
import Icon from 'react-native-vector-icons/Ionicons';

const optionalConfigObject = {
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // if true is passed, itwill allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
};

const SettingPasscode = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const [passcode, setPasscode] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [verifyPasscode, setVerifyPasscode] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [touchSupported, setTouchSupported] = useState(false);
  const [touchType, setTouchType] = useState('');
  const setLocalAuthEnabled = useSetRecoilState(localAuthEnabledAtom);

  useEffect(() => {
    TouchID.isSupported(optionalConfigObject)
      .then((biometryType) => {
        // Success code
        if (biometryType === 'FaceID') {
          setTouchType(biometryType);
          console.log('FaceID is supported.');
        } else {
          setTouchType('TouchID');
          console.log('TouchID is supported.');
        }
        setTouchSupported(true);
      })
      .catch((err: any) => {
        // Failure code
        console.log(err);
      });
  }, []);

  useEffect(() => {
    (async () => {
      const localPasscode = await getAppPasscode();
      const isEnabled = await getAppPasscodeSetting();
      setEnabled(isEnabled);
      setPasscode(localPasscode);
      setLoading(false);
    })();
  }, []);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  if (loading) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ActivityIndicator color={theme.textColor} />
      </View>
    );
  }

  if (!passcode && enabled) {
    return <NewPasscode />;
  }

  const verify = () => {
    setError('');
    if (verifyPasscode !== passcode) {
      setError(getLanguageString(language, 'INCORRECT_PASSCODE'));
      return;
    }
    setVerified(true);
  };

  const authByTouchID = async () => {
    TouchID.authenticate('Use touch ID to access wallet', optionalConfigObject)
      .then(() => {
        setVerified(true);
      })
      .catch((err: any) => {
        // Failure code
        console.log(err);
      });
  };

  if (!verified && enabled) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <Text style={[styles.title, {color: theme.textColor, fontSize: 18}]}>
          {getLanguageString(language, 'ENTER_PASSCODE')}
        </Text>
        <View style={{marginBottom: 32, width: '100%'}}>
          <OtpInputs
            // TODO: remove ts-ignore after issue fixed
            // @ts-ignore
            keyboardType="decimal-pad"
            handleChange={setVerifyPasscode}
            numberOfInputs={4}
            secureTextEntry={true}
            autofillFromClipboard={false}
            style={{
              flexDirection: 'row',
              // paddingHorizontal: 20,
              justifyContent: 'space-evenly',
            }}
            inputStyles={{
              // borderColor: theme.outlineBorderColor,
              // borderWidth: 1,
              textAlign: 'center',
              width: 52,
              height: 64,
              backgroundColor: theme.backgroundFocusColor,
              borderRadius: 8,
              color: theme.textColor,
              fontSize: 30
            }}
          />
          {error !== '' && (
            <Text
              style={{
                color: 'red',
                paddingHorizontal: 20,
                fontStyle: 'italic',
              }}>
              {error}
            </Text>
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
            <Text style={{color: theme.textColor}}>
              Authenticate by {touchType}
            </Text>
          </TouchableOpacity>
        )}
        <Button
          style={{marginHorizontal: 20}}
          title={getLanguageString(language, 'CONFIRM')}
          onPress={verify}
        />
      </View>
    );
  }

  // const toggleSetting = async (isOn: boolean) => {
  //   setLoading(true);
  //   await saveAppPasscodeSetting(isOn);
  //   if (!isOn) {
  //     setPasscode('');
  //     setVerified(false);
  //     await saveAppPasscode('');
  //     setLocalAuthEnabled(false);
  //   }
  //   setEnabled(isOn);
  //   setLoading(false);
  // };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundColor,
          justifyContent: 'flex-start',
          paddingHorizontal: 0,
          paddingTop: 15,
        },
      ]}>
      {/* <View style={styles.settingItemContainer}>
        <Text style={[styles.settingTitle, {color: theme.textColor}]}>
          {getLanguageString(language, 'PASSCODE_SETTING_TRIGGER')}
        </Text>
        <ToggleSwitch
          isOn={enabled}
          onColor="green"
          offColor="gray"
          onToggle={toggleSetting}
        />
      </View> */}
      {enabled && (
        <TouchableOpacity
          style={styles.settingItemContainer}
          onPress={() => setPasscode('')}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>
            {getLanguageString(language, 'CHANGE_PASSCODE')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SettingPasscode;
