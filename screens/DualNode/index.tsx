import { useFocusEffect } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Image, Keyboard, Platform, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { languageAtom } from '../../atoms/language'
import { statusBarColorAtom } from '../../atoms/statusBar'
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets'
import Button from '../../components/Button'
import Divider from '../../components/Divider'
import SelectModal from '../../components/SelectModal'
import CustomText from '../../components/Text'
import TextInput from '../../components/TextInput'
import { getSupportedChains } from '../../services/dualnode'
import { getBalance } from '../../services/krc20'
import { ThemeContext } from '../../ThemeContext'
import { getLanguageString } from '../../utils/lang'
import { formatNumberString, getDigit } from '../../utils/number'
import { getFromClipboard, getLogoURL } from '../../utils/string'
import { getSemiBoldStyle } from '../../utils/style'
import AddressBookModal from '../common/AddressBookModal'
import ScanQRAddressModal from '../common/ScanQRAddressModal'
import AssetSelector from './AssetSelector'
import BalanceInput from './BalanceInput'
import InfoSection from './InfoSection'
import NetworkSelector from './NetworkSelector'
import {styles} from './styles'

export default () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [address, setAddress] = useState('')
  const [errorAddress, setErrorAddress] = useState('')
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);

  const [chain, setChain] = useState<DualNodeChain>(getSupportedChains()[0]);
  const [asset, setAsset] = useState<DualNodeToken>();
  const [errorAsset, setErrorAsset] = useState('')
  const [balance, setBalance] = useState(new BigNumber(0))
  const [amount, setAmount] = useState('')
  const [errorAmount, setErrorAmount] = useState('')
  const [minSwap, setMinSwap] = useState('')
  const [maxSwap, setMaxSwap] = useState('')
  const [swapFeeRatePerMillion, setSwapFeeRatePerMillion] = useState(0)
  const [swapFee, setSwapFee] = useState(0)

  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  const insets = useSafeAreaInsets()

  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  useEffect(() => {
    (async () => {
      if (!asset || !wallets) return
      if (!wallets[selectedWallet]) return

      const _balance = await getBalance(asset.address, wallets[selectedWallet].address)
      if (_balance) {
        setBalance(new BigNumber(_balance))
      }
    })()
  }, [asset])

  useEffect(() => {
    setAsset(undefined)
    setAmount('0')
    setErrorAmount('')
  }, [chain])

  useEffect(() => {
    setAmount('0')
    setErrorAmount('')
  }, [asset])

  const showAddressBookSelector = () => {
    setShowAddressBookModal(true);
  };

  const showQRScanner = () => {
    setShowQRModal(true);
  };

  const handleConvert = () => {
    // Reset error state
    setErrorAsset('')
    setErrorAddress('')
    setErrorAmount('')

    // Validate form
    let isValid = true
    if (!asset) {
      setErrorAsset(getLanguageString(language, 'REQUIRED_FIELD'))
      isValid = false
    }
    if (!address) {
      setErrorAddress(getLanguageString(language, 'REQUIRED_FIELD'))
      isValid = false
    }

    if (!isValid) return

    const amountBN = new BigNumber(getDigit(amount))
    if (amountBN.isGreaterThan(balance.dividedBy(10 ** asset!.decimals))) {
      setErrorAmount(getLanguageString(language, 'NOT_ENOUGH_KRC20_FOR_TX').replace('{{SYMBOL}}', asset!.symbol))
      isValid = false
    }
    const netAmountSwap = amountBN.minus(swapFee)

    if (netAmountSwap.isLessThan(minSwap)) {

    }

  }

  if (showQRModal) {
    return (
      <ScanQRAddressModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        onScanned={(_address) => {
          setAddress(_address);
          setShowQRModal(false);
        }}
      />
    );
  }

  if (showAddressBookModal) {
    return (
      <AddressBookModal
        visible={showAddressBookModal}
        onClose={() => setShowAddressBookModal(false)}
        onSelectAddress={(_address: string) => {
          setAddress(_address);
          setShowAddressBookModal(false);
        }}
      />
    );
  }

  return (
    <View
      style={{
        backgroundColor: theme.backgroundColor,
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 8 : insets.top
      }}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{backgroundColor: 'blue'}}>
        <View 
          style={{flex: 1}}
        >
          <CustomText
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 24,
            }}
          >
            Dual Node
          </CustomText>
          <ScrollView contentContainerStyle={{flex: 1, flexGrow: 1}}>
            <View onStartShouldSetResponder={() => true}>
              <NetworkSelector selectedChain={chain} onSelectChain={(newChain) => setChain(newChain)} />
              <AssetSelector asset={asset} selectAsset={setAsset} supportedAssets={chain.supportedAssets} errorAsset={errorAsset} />
              <CustomText style={[styles.headline, {color: theme.textColor, fontSize: theme.defaultFontSize + 1}]}>
                {getLanguageString(language, 'CREATE_TX_ADDRESS')}
              </CustomText>
              <View
                style={{
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}>
                <View style={{flex: 3}}>
                  <TextInput
                    onChangeText={setAddress}
                    message={errorAddress}
                    value={address}
                    inputStyle={{
                      backgroundColor: 'rgba(96, 99, 108, 1)',
                      color: theme.textColor,
                      paddingRight: 60
                    }}
                    placeholder={getLanguageString(language, 'CREATE_TX_ADDRESS_PLACEHOLDER')}
                    placeholderTextColor={theme.mutedTextColor}
                    // headline={getLanguageString(language, 'CREATE_TX_ADDRESS')}
                    icons={() => {
                      return (
                        <TouchableOpacity
                          style={{position: 'absolute', right: 10}}
                          onPress={async () => setAddress(await getFromClipboard())}
                        >
                          <CustomText
                            style={{
                              color: theme.urlColor,
                              fontWeight: '500',
                              fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
                            }}
                          >
                            Paste
                          </CustomText>
                        </TouchableOpacity>
                      )
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={showQRScanner}
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
                    marginHorizontal: 8,
                  }}>
                  <Image
                    source={require('../../assets/icon/scan_qr_dark.png')}
                    style={{width: 18, height: 18}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={showAddressBookSelector}
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
                  }}>
                  <Image
                    source={require('../../assets/icon/address_book_dark.png')}
                    style={{width: 18, height: 18}}
                  />
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                <Image 
                  source={require('../../assets/icon/warning_yellow.png')}
                  style={{
                    width: 13,
                    height: 20,
                    resizeMode: 'contain',
                    marginRight: 8
                  }}
                />
                <CustomText
                  style={[{
                    color: theme.textColor,
                    fontSize: theme.defaultFontSize
                  }, getSemiBoldStyle()]}
                >
                  {chain.supportedTokenStandard.join(', ')} address only
                </CustomText>
              </View>
              {
                asset && 
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, marginBottom: 12}}>
                  <CustomText 
                    style={[{
                      color: theme.textColor,
                      fontSize: theme.defaultFontSize + 1
                    }, getSemiBoldStyle()]}
                  >
                    {getLanguageString(language, 'AMOUNT')}
                  </CustomText>
                  <CustomText
                    style={[{
                      color: theme.mutedTextColor,
                      fontSize: theme.defaultFontSize
                    }, getSemiBoldStyle()]}
                  >
                    {getLanguageString(language, 'BALANCE')}:{' '}
                    <CustomText
                      style={{
                        color: theme.textColor
                      }}
                    >
                      {
                        formatNumberString(
                          balance.dividedBy(
                            10 ** asset.decimals
                          ).toFixed(), 
                          4
                        )
                      }
                    </CustomText>
                  </CustomText>
                </View>
              }
              {
                asset && 
                <BalanceInput 
                  amount={amount} 
                  setAmount={setAmount}
                  token={asset}
                  currentBalance={balance}
                  chain={chain}
                  errorAmount={errorAmount}
                />
              }
              <Divider />
              {
                asset &&
                <InfoSection 
                  chain={chain} 
                  token={asset} 
                  minSwap={minSwap}
                  setMinSwap={setMinSwap}
                  maxSwap={maxSwap}
                  setMaxSwap={setMaxSwap}
                  swapFeeRatePerMillion={swapFeeRatePerMillion}
                  swapFee={swapFee}
                  setSwapFee={setSwapFee}
                  setSwapFeeRatePerMillion={setSwapFeeRatePerMillion}
                  amount={getDigit(amount)}
                />
              }
            </View>
          </ScrollView>  
          <Button 
            title={getLanguageString(language, 'DUAL_NODE_CONVERT')}
            onPress={handleConvert}
            style={{
              marginBottom: 24
            }}
            textStyle={
              {...getSemiBoldStyle(), ...{fontSize: theme.defaultFontSize + 4}}
            }
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}