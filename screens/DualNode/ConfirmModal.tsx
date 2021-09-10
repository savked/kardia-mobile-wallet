import BigNumber from 'bignumber.js';
import React, { useContext, useMemo } from 'react';
import { Image } from 'react-native';
import { View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import Button from '../../components/Button';
import Divider from '../../components/Divider';
import CustomModal from '../../components/Modal';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { formatNumberString, getDigit } from '../../utils/number';
import { truncate } from '../../utils/string';
import { getSemiBoldStyle } from '../../utils/style';

export default ({visible, onClose, submitSwap, asset, chain, amount, receiver, swapFee}: {
  visible: boolean;
  onClose: () => void;
  submitSwap: () => void;
  chain: DualNodeChain;
  asset?: DualNodeToken;
  amount: string;
  receiver: string;
  swapFee: number;
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const getOtherChainToken = () => {
    if (!asset) return undefined
    const otherChainToken = chain.otherChainToken
    return otherChainToken[asset.address]
  }

  const otherChainToken = useMemo(() => {
    return getOtherChainToken();
  }, [asset])

  const amountToReceive = useMemo(() => {
    const amountBn = new BigNumber(getDigit(amount))
    const feeBn = new BigNumber(swapFee.toString())

    return amountBn.minus(feeBn).toFixed()

  }, [amount, swapFee])

  const getContentStyle = () => {
    return {
      backgroundColor: theme.backgroundFocusColor,
      padding: 20,
      height: 500,
      justifyContent: 'flex-start'
    }
  }

  if (!asset) return null

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={getContentStyle()}
    >
      <View
        style={{
          padding: 15,
          backgroundColor: theme.backgroundStrongColor,
          borderRadius: 16,
          position: 'absolute',
          top: -25
        }}
      >
        <Image 
          source={require('../../assets/icon/crosschain_swap.png')}
          style={{
            width: 32,
            height: 32
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 24
        }}
      >
        <CustomText
          style={{
            marginRight: 8,
            fontSize: theme.defaultFontSize + 20,
            fontWeight: 'bold',
            color: theme.textColor
          }}
        >
          {
            formatNumberString(getDigit(amount))
          }
        </CustomText>
        <CustomText
          style={[{
            fontSize: theme.defaultFontSize + 6,
            color: theme.textColor
          }, getSemiBoldStyle()]}
        >
          {asset.symbol}
        </CustomText>
      </View>
      <Divider style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 1}} />
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <CustomText
          style={[{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 1
          }, getSemiBoldStyle()]}
        >
          {getLanguageString(language, 'TARGET_CHAIN')}
        </CustomText>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image 
            source={{uri: chain.icon}}
            style={{
              width: 20,
              height: 20,
              marginRight: 4
            }}
          />
          <CustomText
            style={[{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 3
            }, getSemiBoldStyle()]}
          >
            {chain.name}
          </CustomText>
        </View>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16
      }}>
        <CustomText
          style={[{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 1
          }, getSemiBoldStyle()]}
        >
          {getLanguageString(language, 'TOKEN_TO_RECEIVE')}
        </CustomText>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image 
            source={{uri: otherChainToken ? otherChainToken.avatar : ''}}
            style={{
              width: 20,
              height: 20,
              marginRight: 4
            }}
          />
          <CustomText
            style={[{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 3
            }, getSemiBoldStyle()]}
          >
            {otherChainToken?.symbol}
          </CustomText>
        </View>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16
      }}>
        <CustomText
          style={[{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 1
          }, getSemiBoldStyle()]}
        >
          {getLanguageString(language, 'FEE')}
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {formatNumberString((new BigNumber(swapFee)).toFixed())}{' '}
          <CustomText
            style={[{
              color: theme.mutedTextColor,
              fontSize: theme.defaultFontSize + 3
            }, getSemiBoldStyle()]}
          >
            {asset.symbol}
          </CustomText>
        </CustomText>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16
      }}>
        <CustomText
          style={[{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 1
          }, getSemiBoldStyle()]}
        >
          {getLanguageString(language, 'AMOUNT_TO_RECEIVE')}
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {formatNumberString(amountToReceive)}{' '}
          <CustomText
            style={[{
              color: theme.mutedTextColor,
              fontSize: theme.defaultFontSize + 3
            }, getSemiBoldStyle()]}
          >
            {asset.symbol}
          </CustomText>
        </CustomText>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16
      }}>
        <CustomText
          style={[{
            color: theme.mutedTextColor,
            fontSize: theme.defaultFontSize + 1
          }, getSemiBoldStyle()]}
        >
          {getLanguageString(language, 'ADDRESS')}
        </CustomText>
        <CustomText
          style={[{
            color: theme.textColor,
            fontSize: theme.defaultFontSize + 3
          }, getSemiBoldStyle()]}
        >
          {truncate(receiver, 10, 10)}
        </CustomText>
      </View>
      <Divider style={{width: '100%', backgroundColor: 'rgba(96, 99, 108, 1)', height: 1}} />
      <Button 
        title={getLanguageString(language, 'CANCEL')}
        onPress={onClose}
        block
        type="outline"
        style={{
          marginTop: 32
        }}
        textStyle={{
          ...getSemiBoldStyle(),
          ...{
            fontSize: theme.defaultFontSize + 5
          }
        }}
      />
      <Button 
        title={getLanguageString(language, 'DUAL_NODE_CONVERT')}
        onPress={submitSwap}
        style={{
          marginTop: 12
        }}
        textStyle={{
          ...getSemiBoldStyle(),
          ...{
            fontSize: theme.defaultFontSize + 5
          }
        }}
      />
    </CustomModal>
  )
}