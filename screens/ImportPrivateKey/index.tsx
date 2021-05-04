import {useFocusEffect, useNavigation} from '@react-navigation/native';
/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {Dimensions, Image, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../atoms/language';
import IconButton from '../../components/IconButton';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';
import ScanMode from './ScanMode';
import InputMode from './InputMode';
import { statusBarColorAtom } from '../../atoms/statusBar';
import { ThemeContext } from '../../ThemeContext';
import CustomText from '../../components/Text';
// import {RNCamera} from 'react-native-camera';

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');

export default () => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  const [mode, setMode] = useState('scan');

  const theme = useContext(ThemeContext);

  useEffect(() => {
    setStatusBarColor(mode === 'scan' ? theme.backgroundColor : theme.backgroundFocusColor);
  }, [mode]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {mode === 'scan' && <ScanMode />}
        <View
          style={{
            position: 'absolute',
            width: viewportWidth,
            height: viewportHeight,
            justifyContent: 'space-between',
            backgroundColor:
              mode === 'enter' ? 'rgba(28, 28, 40, 0.87)' : 'transparent',
          }}>
          {mode === 'scan' && (
            <Image
              source={require('../../assets/qr_background.png')}
              style={{
                resizeMode: 'cover',
                width: viewportWidth,
                height: viewportHeight,
                position: 'absolute',
              }}
            />
          )}
          <View
            style={{padding: 20, alignItems: 'flex-end', width: viewportWidth}}>
            <IconButton
              name="close"
              style={styles.closeIcon}
              onPress={() => navigation.goBack()}
            />
          </View>
          {mode === 'scan' ? (
            <View
              style={{
                marginBottom: (viewportHeight - 256) / 2 - 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{width: 250}}>
                <CustomText
                  style={{
                    textAlign: 'center',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: 24,
                    marginBottom: 4,
                  }}>
                  {getLanguageString(language, 'SCAN_QR_TITLE')}
                </CustomText>
                <CustomText
                  style={{textAlign: 'center', color: '#FFFFFF', fontSize: 15}}>
                  {getLanguageString(language, 'SCAN_QR_PRIVATE_KEY')}
                </CustomText>
              </View>
            </View>
          ) : (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{width: 320, marginBottom: 24}}>
                <CustomText
                  style={{
                    textAlign: 'center',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: 24,
                    marginBottom: 4,
                  }}>
                  {getLanguageString(language, 'ENTER_PRIVATE_KEY')}
                </CustomText>
                <CustomText
                  style={{textAlign: 'center', color: '#FFFFFF', fontSize: 15}}>
                  {getLanguageString(language, 'ENTER_QR_PRIVATE_KEY')}
                </CustomText>
              </View>
              <View style={{width: 320}}>
                <InputMode />
              </View>
            </View>
          )}

          <View
            style={{
              backgroundColor: theme.backgroundColor,
              marginHorizontal: 20,
              marginVertical: 40,
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              onPress={() => setMode('scan')}
              style={{
                flex: 1,
                backgroundColor:
                  mode === 'scan' ? theme.backgroundFocusColor : 'transparent',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'SCAN_MODE')}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('enter')}
              style={{
                flex: 1,
                backgroundColor:
                  mode === 'enter' ? theme.backgroundFocusColor : 'transparent',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <CustomText style={{color: theme.textColor}}>{getLanguageString(language, 'INPUT_MODE')}</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
