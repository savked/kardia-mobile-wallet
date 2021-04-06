import {useNavigation} from '@react-navigation/native';
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import IconButton from '../../components/IconButton';
import {theme} from '../../theme/dark';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';
import ScanMode from './ScanMode';
import InputMode from './InputMode';
// import {RNCamera} from 'react-native-camera';

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');

export default () => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);

  const [mode, setMode] = useState('scan');

  return (
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
              <Text
                allowFontScaling={false}
                style={{
                  textAlign: 'center',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: 24,
                  marginBottom: 4,
                }}>
                {getLanguageString(language, 'SCAN_QR_TITLE')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{textAlign: 'center', color: '#FFFFFF', fontSize: 15}}>
                {getLanguageString(language, 'SCAN_QR_PRIVATE_KEY')}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={{width: 320, marginBottom: 24}}>
              <Text
                allowFontScaling={false}
                style={{
                  textAlign: 'center',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: 24,
                  marginBottom: 4,
                }}>
                {getLanguageString(language, 'ENTER_PRIVATE_KEY')}
              </Text>
              <Text
                allowFontScaling={false}
                style={{textAlign: 'center', color: '#FFFFFF', fontSize: 15}}>
                {getLanguageString(language, 'ENTER_QR_PRIVATE_KEY')}
              </Text>
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
            <Text allowFontScaling={false} style={{color: theme.textColor}}>{getLanguageString(language, 'SCAN_MODE')}</Text>
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
            <Text allowFontScaling={false} style={{color: theme.textColor}}>{getLanguageString(language, 'INPUT_MODE')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
