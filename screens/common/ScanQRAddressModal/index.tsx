/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Dimensions, Image, Text, View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import {getLanguageString} from '../../../utils/lang';
import {styles} from './style';
import Portal from '@burstware/react-native-portal';
import IconButton from '../../../components/IconButton';
import CustomText from '../../../components/Text';

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');

const ScanQRAddressModal = ({
  visible,
  onClose,
  onScanned,
}: {
  visible: boolean;
  onClose: () => void;
  onScanned: (address: string) => void;
}) => {
  const language = useRecoilValue(languageAtom);
  if (!visible) {
    return null;
  }
  return (
    <Portal>
      <View
        style={{
          // position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
        }}>
        {/* <View style={styles.qrScannerHeader}>
          <CustomText style={styles.centerText}>
            {getLanguageString(language, 'SCAN_QR_FOR_ADDRESS')}
          </CustomText>
        </View> */}
        <QRCodeScanner
          onRead={(e) => {
            onScanned(e.data);
          }}
          // showMarker={true}
          topViewStyle={{height: 0}}
          bottomViewStyle={{height: 10}}
          cameraStyle={{height: viewportHeight}}
          cameraProps={{useCamera2Api: true}}
        />
        <Image
          source={require('../../../assets/qr_background.png')}
          style={{
            resizeMode: 'cover',
            width: viewportWidth,
            height: viewportHeight,
            position: 'absolute',
          }}
        />
        <View
          style={{padding: 20, alignItems: 'flex-end', width: viewportWidth}}>
          <IconButton name="close" style={styles.closeIcon} onPress={onClose} />
        </View>
        <View
          style={{
            marginTop: (viewportHeight - 256) / 2 - 130,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={{width: 250}}>
            <CustomText
              allowFontScaling={false}
              style={{
                textAlign: 'center',
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: 24,
                marginBottom: 4,
              }}>
              {getLanguageString(language, 'SCAN_QR_TITLE')}
            </CustomText>
            <CustomText style={{textAlign: 'center', color: '#FFFFFF', fontSize: 15}}>
              {getLanguageString(language, 'SCAN_QR_FOR_ADDRESS_DESCRIPTION')}
              {/* Scan your seed phrase QR code, then we will do the rest */}
            </CustomText>
          </View>
        </View>
      </View>
    </Portal>
  );
};

export default ScanQRAddressModal;
