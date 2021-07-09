/* eslint-disable react-native/no-inline-styles */
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Image, Keyboard, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Text, TouchableOpacity, View} from 'react-native';
import OtpInputs, {OtpInputsRef} from 'react-native-otp-inputs';
import TouchID from 'react-native-touch-id';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import {ThemeContext} from '../../../ThemeContext';
import {getLanguageString} from '../../../utils/lang';
import {getAppPasscode} from '../../../utils/local';
import {styles} from './style';
import Divider from '../../../components/Divider';
import CustomText from '../../../components/Text';
import { formatNumberString } from '../../../utils/number';
import BigNumber from 'bignumber.js';
import { DANGEROUS_KAI_AMOUNT, DANGEROUS_TX_FEE_KAI } from '../../../config';

const optionalConfigObject = {
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // if true is passed, itwill allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
};

export default ({
  visible,
  onClose,
  onSuccess,
  gasPrice,
  gasLimit,
  amount,
  amountKRC20 = '',
  krc20Symbol = ''
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gasPrice?: string;
  gasLimit?: string;
  amount?: string;
  amountKRC20?: string;
  krc20Symbol?: string;
}) => {
  const otpRef = useRef<OtpInputsRef>(null);
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [touchSupported, setTouchSupported] = useState(false);
  const [touchType, setTouchType] = useState('');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const [authStep, setAuthStep] = useState('1')

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false);
  };

  useEffect(() => {
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

    if (Platform.OS === 'ios') {
      Keyboard.addListener('keyboardWillShow', _keyboardDidShow);
      Keyboard.addListener('keyboardWillHide', _keyboardDidHide);
    } else {
      Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    }

    // cleanup function
    return () => {
      if (Platform.OS === 'ios') {
        Keyboard.removeListener('keyboardWillShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardWillHide', _keyboardDidHide);
      } else {
        Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
      }
    };
  }, []);

  const resetOTP = useCallback(() => {
    otpRef && otpRef.current && otpRef.current.reset();
  }, []);

  useEffect(() => {
    if (visible && touchSupported) {
      if (authStep === '1' && gasPrice && gasLimit && amount) return
      else {
        authByTouchID()
      }
    }
  }, [visible, touchSupported, authStep, gasPrice, gasLimit, amount])

  const verify = async () => {
    const localPass = await getAppPasscode();
    if (localPass !== passcode) {
      setError(getLanguageString(language, 'WRONG_PIN'));
      return;
    }
    onSuccess();
    onClose();
  };

  const authByTouchID = async () => {
    TouchID.authenticate(
      `Use ${touchType} to access wallet`,
      optionalConfigObject,
    )
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err: any) => {
        // Failure code
        console.log(err);
      });
  };

  const closeAuthModal = () => {
    resetOTP();
    onClose();
  };

  const getModalStyle = () => {
    if (Platform.OS === 'android') {
      return {
        height: 370,
        backgroundColor: theme.backgroundFocusColor,
        alignItems: 'center',
        justifyContent: 'flex-start',
      };
    } else {
      return {
        height: 350,
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
      };
    }
  };

  const getConfirmModalStyle = () => {
    if (Platform.OS === 'android') {
      return {
        height: isDangerous() ? 420 : 390,
        backgroundColor: theme.backgroundFocusColor,
        alignItems: 'center',
        justifyContent: 'flex-start',
      };
    } else {
      return {
        height: isDangerous() ? 420 : 390,
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start',
        alignItems: 'center',
      };
    }
  }

  const calculateTotalCost = () => {
    if (!gasLimit || !gasPrice || !amount) return ''
    const gasCostInKAI = (new BigNumber(gasPrice)).multipliedBy(new BigNumber(gasLimit)).dividedBy(new BigNumber(10 ** 9))
    return gasCostInKAI.plus(new BigNumber(amount)).toFixed()
  }

  const calculateTxFee = () => {
    if (!gasLimit || !gasPrice || !amount) return ''
    const gasCostInKAI = (new BigNumber(gasPrice)).multipliedBy(new BigNumber(gasLimit)).dividedBy(new BigNumber(10 ** 9))
    return gasCostInKAI.toFixed()
  }

  const isDangerous = () => {
    // return Number(calculateTotalCost()) > DANGEROUS_KAI_AMOUNT
    return Number(calculateTxFee()) < DANGEROUS_TX_FEE_KAI
  }

  if (authStep === '1' && gasPrice && gasLimit && amount) {
    return (
      <Modal
        visible={authStep === '1' && visible}
        showCloseButton={false}
        onClose={closeAuthModal}
        contentStyle={getConfirmModalStyle()}
      >
        <CustomText
          style={{
            textAlign: 'center',
            color: theme.textColor,
            fontSize: 20,
            marginBottom: 14,
            fontWeight: 'bold'
          }}>
          {getLanguageString(language, 'AUTH_TX_TOTAL_COST')}
        </CustomText>
        <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
          <CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'GAS_PRICE')}</CustomText>
          <CustomText style={{color: theme.textColor}}>{formatNumberString(gasPrice)} OXY</CustomText>
        </View>
        <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
          <CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'GAS_LIMIT')}</CustomText>
          <CustomText style={{color: theme.textColor}}>{formatNumberString(gasLimit)}</CustomText>
        </View>
        <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8}}>
          <CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'AMOUNT')}</CustomText>
          <View style={{alignItems: 'flex-end'}}>
            <CustomText style={{color: theme.textColor}}>{formatNumberString(amount)} KAI</CustomText>
            {
              amountKRC20 !== '' && 
              <CustomText style={{color: theme.textColor, marginTop: 4}}>{formatNumberString(amountKRC20)} {krc20Symbol}</CustomText>
            }
          </View>
        </View>
        <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8}}>
          <CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'TX_FEE')}</CustomText>
          <View style={{alignItems: 'flex-end'}}>
            <CustomText style={{color: theme.textColor}}>
              {formatNumberString(calculateTxFee())} KAI
            </CustomText>
          </View>
        </View>
        <View style={{width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8}}>
          <CustomText style={{color: theme.mutedTextColor}}>{getLanguageString(language, 'TOTAL_COST')}</CustomText>
          <View style={{alignItems: 'flex-end'}}>
            <CustomText style={{color: theme.textColor}}>
              {formatNumberString(calculateTotalCost())} KAI
            </CustomText>
            {
              amountKRC20 !== '' && 
              <CustomText style={{color: theme.textColor, marginTop: 4}}>{formatNumberString(amountKRC20)} {krc20Symbol}</CustomText>
            }
          </View>
        </View>
        {
          isDangerous() && (
            <CustomText
              style={{
                fontWeight: 'bold',
                width: '100%',
                textAlign: 'center',
                color: theme.warningTextColor,
                marginVertical: 12,
              }}
            >
              {getLanguageString(language, 'TX_FEE_WARNING')}
            </CustomText>
          )
        }
        <Button
          title={getLanguageString(language, 'CANCEL')}
          onPress={closeAuthModal}
          type="outline"
          style={{marginBottom: 12, marginTop: 24}}
          block
        />
        <Button
          title={getLanguageString(language, 'CONFIRM')}
          onPress={() => setAuthStep('2')}
          textStyle={{
            fontWeight: '500', fontSize: theme.defaultFontSize + 3,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
          type="primary"
          block
        />
      </Modal>
    )
  }

  return (
    <Modal
      visible={visible}
      showCloseButton={false}
      onClose={() => {
        setAuthStep('1')
        closeAuthModal()
      }}
      contentStyle={getModalStyle()}>
      <CustomText
        style={{
          textAlign: 'center',
          color: theme.mutedTextColor,
          fontSize: 15,
        }}>
        {getLanguageString(language, 'ENTER_PIN_CODE')}
      </CustomText>
      <OtpInputs
        // TODO: remove ts-ignore after issue fixed
        // @ts-ignore
        keyboardType="decimal-pad"
        // value={passcode}
        handleChange={setPasscode}
        numberOfInputs={4}
        autofillFromClipboard={false}
        style={styles.otpContainer}
        inputStyles={{
          ...styles.otpInput,
          ...{backgroundColor: theme.backgroundColor},
        }}
        secureTextEntry={true}
        ref={otpRef}
      />
      {error !== '' && (
        <CustomText
          style={{color: 'red', paddingHorizontal: 20, fontStyle: 'italic'}}>
          {error}
        </CustomText>
      )}
      <Divider style={{width: 32, backgroundColor: '#F0F1F2'}} />
      {touchSupported && (
        <TouchableOpacity
          onPress={authByTouchID}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 24,
          }}>
          {touchType === 'FaceID' ? (
            <Image
              style={{width: 30, height: 30, marginRight: 8}}
              source={require('../../../assets/icon/face_id_dark.png')}
            />
          ) : (
            <Icon
              style={{marginRight: 12}}
              name="finger-print"
              color={theme.textColor}
              size={24}
            />
          )}
          <CustomText style={{color: theme.textColor, fontSize: 15}}>
            Authenticate by {touchType}
          </CustomText>
        </TouchableOpacity>
      )}
      <View style={{width: '100%'}}>
        <Button
          title={getLanguageString(language, 'CANCEL')}
          onPress={() => {
            setAuthStep('1')
            closeAuthModal()
          }}
          type="outline"
          style={{marginBottom: 12}}
          block
        />
        <Button
          title={getLanguageString(language, 'CONFIRM')}
          onPress={verify}
          textStyle={{
            fontWeight: '500', fontSize: theme.defaultFontSize + 3,
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
          }}
          type="primary"
          block
        />
      </View>
    </Modal>
  );
};
