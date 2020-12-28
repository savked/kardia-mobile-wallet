/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import OtpInputs from 'react-native-otp-inputs';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import Button from '../../components/Button';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {
  getAppPasscode,
  getAppPasscodeSetting,
  saveAppPasscode,
  saveAppPasscodeSetting,
} from '../../utils/local';
import NewPasscode from './NewPasscode';
import {styles} from './style';

const SettingPasscode = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const [passcode, setPasscode] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [verifyPasscode, setVerifyPasscode] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const localPasscode = await getAppPasscode();
      const isEnabled = await getAppPasscodeSetting();
      setEnabled(isEnabled);
      setPasscode(localPasscode);
      setLoading(false);
    })();
  }, []);

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

  if (!verified && enabled) {
    return (
      <View
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <Text style={[styles.title, {color: theme.textColor, fontSize: 18}]}>
          {getLanguageString(language, 'ENTER_PASSCODE')}
        </Text>
        <View style={{marginBottom: 40}}>
          <OtpInputs
            keyboardType="phone-pad"
            handleChange={setVerifyPasscode}
            numberOfInputs={4}
            autofillFromClipboard={false}
            style={{
              flexDirection: 'row',
              paddingHorizontal: 20,
              justifyContent: 'space-between',
            }}
            inputStyles={{
              borderColor: theme.outlineBorderColor,
              borderWidth: 1,
              textAlign: 'center',
              width: 50,
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
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
        <Button
          style={{marginHorizontal: 20}}
          title={getLanguageString(language, 'CONFIRM')}
          onPress={verify}
        />
      </View>
    );
  }

  const toggleSetting = async (isOn: boolean) => {
    setLoading(true);
    await saveAppPasscodeSetting(isOn);
    if (!isOn) {
      setPasscode('');
      setVerified(false);
      await saveAppPasscode('');
    }
    setEnabled(isOn);
    setLoading(false);
  };

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
      <View style={styles.settingItemContainer}>
        <Text style={[styles.settingTitle, {color: theme.textColor}]}>
          {getLanguageString(language, 'PASSCODE_SETTING_TRIGGER')}
        </Text>
        <ToggleSwitch
          isOn={enabled}
          onColor="green"
          offColor="red"
          onToggle={toggleSetting}
        />
      </View>
      {enabled && (
        <TouchableOpacity
          style={styles.settingItemContainer}
          onPress={() => setPasscode('')}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>
            Change passcode
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SettingPasscode;
