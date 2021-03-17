/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import Modal from '../../../components/Modal';
import {Keyboard, Text, TouchableWithoutFeedback, View} from 'react-native';
import TextInput from '../../../components/TextInput';
import {styles} from './style';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import {getLanguageString} from '../../../utils/lang';
import Icon from 'react-native-vector-icons/FontAwesome';
import ScanQRAddressModal from '../ScanQRAddressModal';
import {getKRC20TokenInfo} from '../../../services/krc20';
import {getTokenList, saveTokenList} from '../../../utils/local';
import {krc20ListAtom} from '../../../atoms/krc20';
import Button from '../../../components/Button';
import {DEFAULT_KRC20_TOKENS} from '../../../config';
import {parseDecimals} from '../../../utils/number';
import numeral from 'numeral';

const NewTokenModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const language = useRecoilValue(languageAtom);
  const [tokenAddress, setTokenAddress] = useState('');
  const [errorAddress, setErrorAddress] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState(-1);
  const [totalSupply, setTotalSupply] = useState('');
  const [avatar, setAvatar] = useState('');

  const setKRC20List = useSetRecoilState(krc20ListAtom);

  useEffect(() => {
    (async () => {
      if (tokenAddress.length !== 42 && tokenAddress.length !== 40) {
        return;
      }
      const _tokenAddress =
        tokenAddress.length === 42 ? tokenAddress : `0x${tokenAddress}`;
      const info = await getKRC20TokenInfo(_tokenAddress);
      setName(info.name);
      setSymbol(info.symbol);
      setDecimals(info.decimals);
      setTotalSupply(info.totalSupply);
      setAvatar(info.avatar);
    })();
  }, [tokenAddress]);

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
    const existed = localTokens.some((i) => i.address === _tokenAddress);
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
    });

    const DEFAULT_ID = DEFAULT_KRC20_TOKENS.map((i) => i.id);

    await saveTokenList(newTokenList.filter((i) => !DEFAULT_ID.includes(i.id)));
    setKRC20List(newTokenList);
    clearState();
    onClose();
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

  return (
    <Modal
      visible={visible}
      onClose={() => {
        clearState();
        onClose();
      }}
      contentStyle={{height: !showTokenData() ? 210 : 320}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={[styles.container]}>
          <View style={{marginBottom: 10}}>
            <TextInput
              headlineStyle={{color: 'black'}}
              onChangeText={setTokenAddress}
              message={errorAddress}
              value={tokenAddress}
              inputStyle={{paddingRight: 50}}
              headline={getLanguageString(language, 'TOKEN_ADDRESS')}
              icons={() => {
                return (
                  <Icon
                    onPress={() => setShowQRModal(true)}
                    name="qrcode"
                    size={25}
                    color={'black'}
                    style={[styles.textIcon, {right: 18}]}
                  />
                );
              }}
            />
          </View>
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <Text>
                Token name: <Text style={{fontWeight: 'bold'}}>{name}</Text>
              </Text>
            </View>
          )}
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <Text>
                Token symbol: <Text style={{fontWeight: 'bold'}}>{symbol}</Text>
              </Text>
            </View>
          )}
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <Text>
                Token decimals:{' '}
                <Text style={{fontWeight: 'bold'}}>{decimals}</Text>
              </Text>
            </View>
          )}
          {showTokenData() && (
            <View style={{marginBottom: 10}}>
              <Text>
                Token supply:{' '}
                <Text style={{fontWeight: 'bold'}}>
                  {numeral(parseDecimals(Number(totalSupply), decimals)).format(
                    '0,0.00',
                  )}
                </Text>
              </Text>
            </View>
          )}
          <View>
            <Button title="Add token" onPress={handleImport} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NewTokenModal;
