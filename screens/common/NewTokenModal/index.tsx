/* eslint-disable react-native/no-inline-styles */
import numeral from 'numeral';
import React, { useContext, useEffect, useState } from 'react';
import {
    Image,
    Keyboard,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { krc20ListAtom } from '../../../atoms/krc20';
import { languageAtom } from '../../../atoms/language';
import { selectedWalletAtom, walletsAtom } from '../../../atoms/wallets';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import TextInput from '../../../components/TextInput';
import { DEFAULT_KRC20_TOKENS } from '../../../config';
import { getKRC20TokenInfo } from '../../../services/krc20';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';
import { getTokenList, saveTokenList } from '../../../utils/local';
import { parseDecimals } from '../../../utils/number';
import ScanQRAddressModal from '../ScanQRAddressModal';
import { styles } from './style';

const NewTokenModal = ({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const [tokenAddress, setTokenAddress] = useState('');
  const [errorAddress, setErrorAddress] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState(-1);
  const [totalSupply, setTotalSupply] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  const [keyboardShown, setKeyboardShown] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const setKRC20List = useSetRecoilState(krc20ListAtom);
  const wallets = useRecoilValue(walletsAtom)
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  useEffect(() => {
    (async () => {
      if (tokenAddress.length !== 42 && tokenAddress.length !== 40) {
        return;
      }
      setLoading(true);
      const _tokenAddress =
        tokenAddress.length === 42 ? tokenAddress : `0x${tokenAddress}`;
      const info = await getKRC20TokenInfo(_tokenAddress);
      setName(info.name);
      setSymbol(info.symbol);
      setDecimals(info.decimals);
      setTotalSupply(info.totalSupply);
      setAvatar(info.avatar);
      setLoading(false);
    })();
  }, [tokenAddress]);

  useEffect(() => {
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

  const clearState = () => {
    setTokenAddress('');
    setErrorAddress('');
    setName('');
    setSymbol('');
    setDecimals(-1);
    setTotalSupply('');
  };

  const showTokenData = () => {
    const rs =
      name !== '' && symbol !== '' && totalSupply !== '' && decimals >= 0;
    return rs;
  };

  const handleImport = async () => {
    if (tokenAddress.length !== 42 && tokenAddress.length !== 40) {
      setErrorAddress(getLanguageString(language, 'INVALID_ADDRESS'));
      return;
    }
    if (name === '' || symbol === '' || totalSupply === '') {
      setErrorAddress(getLanguageString(language, 'ERROR_FETCH_KRC20_DATA'));
      return;
    }
    const _tokenAddress =
      tokenAddress.length === 42 ? tokenAddress : `0x${tokenAddress}`;

    let localTokens = await getTokenList();
    const existed = localTokens.some((i) => i.address === _tokenAddress && i.walletOwnerAddress === wallets[selectedWallet].address);
    if (existed) {
      setErrorAddress(getLanguageString(language, 'TOKEN_EXISTS'));
      return;
    }

    const newTokenList: KRC20[] = JSON.parse(JSON.stringify(localTokens));

    newTokenList.push({
      address: _tokenAddress,
      name,
      symbol,
      decimals,
      avatar,
      id: `${Date.now()}`,
      walletOwnerAddress: wallets[selectedWallet].address
    });

    const DEFAULT_ID = DEFAULT_KRC20_TOKENS.map((i) => i.id);

    await saveTokenList(newTokenList.filter((i) => !DEFAULT_ID.includes(i.id)));
    setKRC20List(newTokenList);
    clearState();
    onSuccess();
  };

  if (showQRModal) {
    return (
      <ScanQRAddressModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        onScanned={(_address) => {
          setTokenAddress(_address);
          setShowQRModal(false);
        }}
      />
    );
  }

  const _keyboardDidShow = (e: any) => {
    setKeyboardOffset(e.endCoordinates.height);
    setKeyboardShown(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardOffset(0);
    setKeyboardShown(false);
  };

  const getModalStyle = () => {
    if (Platform.OS === 'android') {
      return {
        height: !showTokenData() ? 300 : 400,
        backgroundColor: theme.backgroundFocusColor,
      };
    } else {
      return {
        height: !showTokenData() ? 300 : 400,
        marginBottom: keyboardOffset,
        marginTop: -keyboardOffset,
        backgroundColor: theme.backgroundFocusColor,
      };
    }
  };

  return (
    <Modal
      visible={visible}
      showCloseButton={false}
      onClose={() => {
        clearState();
        onClose();
      }}
      contentStyle={getModalStyle() as any}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={[styles.container]}>
          <View style={{marginBottom: 0}}>
            <View>
              <CustomText style={[styles.headline, {color: theme.textColor, fontSize: theme.defaultFontSize + 1}]}>
                {getLanguageString(language, 'TOKEN_ADDRESS')}
              </CustomText>
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}>
              <View style={{flex: 3}}>
                <TextInput
                  onChangeText={setTokenAddress}
                  message={errorAddress}
                  value={tokenAddress}
                  inputStyle={{
                    backgroundColor: 'rgba(96, 99, 108, 1)',
                    color: theme.textColor,
                  }}
                  placeholder={getLanguageString(language, 'TOKEN_ADDRESS')}
                  placeholderTextColor={theme.mutedTextColor}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowQRModal(true)}
                style={{
                  // flex: 1,
                  padding: 15,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  height: 44,
                  width: 44,
                  borderWidth: 1.5,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 8,
                }}>
                <Image
                  source={require('../../../assets/icon/scan_qr_dark.png')}
                  style={{width: 18, height: 18}}
                />
              </TouchableOpacity>
            </View>
          </View>
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <CustomText style={{color: theme.textColor}}>
                Token name: <CustomText style={{fontWeight: 'bold'}}>{name}</CustomText>
              </CustomText>
            </View>
          )}
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <CustomText style={{color: theme.textColor}}>
                Token symbol: <CustomText style={{fontWeight: 'bold'}}>{symbol}</CustomText>
              </CustomText>
            </View>
          )}
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <CustomText style={{color: theme.textColor}}>
                Token decimals:{' '}
                <CustomText style={{fontWeight: 'bold'}}>{decimals}</CustomText>
              </CustomText>
            </View>
          )}
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <CustomText style={{color: theme.textColor}}>
                Token supply:{' '}
                <CustomText style={{fontWeight: 'bold', color: theme.textColor}}>
                  {numeral(parseDecimals(Number(totalSupply), decimals)).format(
                    '0,0.00',
                  )}
                </CustomText>
              </CustomText>
            </View>
          )}
          <View>
            <Button
              title={getLanguageString(language, 'CANCEL')}
              style={{marginBottom: 8, marginTop: showTokenData() ? 12 : 36}}
              textStyle={{
                fontWeight: '500',
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
              }}
              type="outline"
              onPress={onClose}
              disabled={loading}
            />
            <Button
              title={getLanguageString(language, 'ADD_TOKEN')}
              textStyle={{
                fontWeight: '500',
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
              }}
              onPress={handleImport}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NewTokenModal;
