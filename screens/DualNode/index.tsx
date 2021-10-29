import { useFocusEffect, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import { KardiaAccount } from 'kardia-js-sdk'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Image, Keyboard, Platform, RefreshControl, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { languageAtom } from '../../atoms/language'
import { showTabBarAtom } from '../../atoms/showTabBar'
import { statusBarColorAtom } from '../../atoms/statusBar'
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets'
import Button from '../../components/Button'
import Divider from '../../components/Divider'
import CustomText from '../../components/Text'
import TextInput from '../../components/TextInput'
import { KAI_BRIDGE_ADDRESS } from '../../config'
import { getDualNodeLiquidity, getSupportedChains, swapCrossChain } from '../../services/dualnode'
import { approveKRC20Token, getBalance, getKRC20ApproveState } from '../../services/krc20'
import { ThemeContext } from '../../ThemeContext'
import { getLanguageString } from '../../utils/lang'
import { cellValueWithDecimals, formatNumberString, getDigit } from '../../utils/number'
import { getFromClipboard } from '../../utils/string'
import { getSemiBoldStyle } from '../../utils/style'
import AddressBookModal from '../common/AddressBookModal'
import ScanQRAddressModal from '../common/ScanQRAddressModal'
import AssetSelector from './AssetSelector'
import BalanceInput from './BalanceInput'
import ConfirmModal from './ConfirmModal'
import InfoSection from './InfoSection'
import NetworkSelector from './NetworkSelector'
import {styles} from './styles'

export default () => {
  const navigation = useNavigation()
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [address, setAddress] = useState('')
  const [errorAddress, setErrorAddress] = useState('')
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);

  const [chain, setChain] = useState<DualNodeChain>();
  const [asset, setAsset] = useState<DualNodeToken>();
  const [errorAsset, setErrorAsset] = useState('')
  const [balance, setBalance] = useState(new BigNumber(0))
  const [amount, setAmount] = useState('')
  const [errorAmount, setErrorAmount] = useState('')
  const [minSwap, setMinSwap] = useState('')
  const [maxSwap, setMaxSwap] = useState('')
  const [swapFeeRatePerMillion, setSwapFeeRatePerMillion] = useState(0)
  const [swapFee, setSwapFee] = useState(0)
  const [liquidity, setLiquidity] = useState('')
  const [approveState, setApproveState] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [loadingLiquidity, setLoadingLiquidity] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [amountTimeoutId, setAmountTimeoutId] = useState<any>()

  const [reloadConfig, setReloadConfig] = useState(0)
  const [reloadingLiquidity, setReloadingLiquidity] = useState(false)
  const [reloadingBalance, setReloadingBalance] = useState(false)

  const wallets = useRecoilValue(walletsAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom)

  const insets = useSafeAreaInsets()

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setStatusBarColor(theme.backgroundColor);
      setTabBarVisible(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  useEffect(() => {
    (async () => {
      const rs = await getSupportedChains()
      setChain(rs[0])
    })()
  }, [])

  const fetchBalance = async () => {
    if (!asset || !wallets) return
    if (!wallets[selectedWallet]) return

    const _balance = await getBalance(asset.address, wallets[selectedWallet].address)
    if (_balance) {
      setBalance(new BigNumber(_balance))
    }

    setReloadingBalance(false)
  }

  useEffect(() => {
    fetchBalance()
  }, [asset, wallets, selectedWallet])

  useEffect(() => {
    setAmount('0')
    setErrorAmount('')

    // const defaultAsset = chain.supportedAssets.find((asset) => asset.address === chain.defaultAsset)
    // setAsset(defaultAsset)
    setAsset(undefined)

  }, [chain])

  useEffect(() => {
    setAmount('0')
    setErrorAmount('')
  }, [asset])

  useEffect(() => {
    (async () => {
      if (!asset) return
      setLoading(true)
      if (amountTimeoutId) {
        clearTimeout(amountTimeoutId)
      }

      const isUnderlying = getUnderlyingToken() ? true : false

      if (!isUnderlying) {
        setApproveState(true)
        setLoading(false)
      } else {
        const timeoutId = setTimeout(async () => {
          const _approveState = await getKRC20ApproveState(asset, getDigit(amount), wallets[selectedWallet], KAI_BRIDGE_ADDRESS)
          setApproveState(_approveState)
          setLoading(false)
          clearTimeout(timeoutId)
          setAmountTimeoutId(null)
        }, 1000)
        setAmountTimeoutId(timeoutId)
      }
    })()
  }, [amount])

  const showAddressBookSelector = () => {
    setShowAddressBookModal(true);
  };

  const showQRScanner = () => {
    setShowQRModal(true);
  };

  const getUnderlyingToken = () => {
    if (!asset || !chain) return undefined
    const underlyingToken = chain.underlyingToken
    return underlyingToken[asset.address]
  }

  const handleConvert = async () => {
    // Reset error state
    // setErrorAsset('')

    if (errorAsset || !chain) {
      return;
    }
    

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
    } else if (!KardiaAccount.isAddress(address)) {
      setErrorAddress(getLanguageString(language, 'INVALID_ADDRESS'))
      isValid = false
    }

    if (!isValid) return

    const amountBN = new BigNumber(getDigit(amount))
    if (amountBN.isGreaterThan(balance.dividedBy(10 ** asset!.decimals))) {
      setErrorAmount(getLanguageString(language, 'NOT_ENOUGH_KRC20_FOR_TX').replace('{{SYMBOL}}', asset!.symbol))
      isValid = false
      return
    }
    const netAmountSwap = amountBN.minus(swapFee)

    if (netAmountSwap.isLessThan(minSwap)) {
      setErrorAmount(
        getLanguageString(language, 'MIN_AMOUNT_SWAP')
          .replace('{{AMOUNT}}', formatNumberString(minSwap))
          .replace('{{SYMBOL}}', asset!.symbol)
      )
      isValid = false
    }

    if (netAmountSwap.isGreaterThan(maxSwap)) {
      setErrorAmount(
        getLanguageString(language, 'MAX_AMOUNT_SWAP')
          .replace('{{AMOUNT}}', formatNumberString(maxSwap))
          .replace('{{SYMBOL}}', asset!.symbol)
      )
      isValid = false
    }

    if (liquidity) {
      const latestLQ = await getDualNodeLiquidity(asset!, chain)
      if (latestLQ) {
        const liquidityBN = new BigNumber(getDigit(latestLQ))
        if (netAmountSwap.isGreaterThan(liquidityBN)) {
          setErrorAmount(getLanguageString(language, 'NOT_ENOUGH_LIQUIDITY'))
          isValid = false
        }
      }
    }

    if (!isValid) return
    setShowConfirmModal(true)
  }

  const handleRefresh = () => {
    if (!asset) return
    setReloadingLiquidity(true)
    setReloadConfig(Date.now())
  }

  useEffect(() => {
    setReloadingBalance(true)
    fetchBalance()
  }, [reloadConfig])

  const submitSwap = async () => {
    // Start swap
    const contractAddress = getContractAddressFromKardiaChain()
    if (!contractAddress || !chain) return
    setLoading(true)
    const transactionHash = await swapCrossChain({
      underlying: getUnderlyingToken() ? true : false,
      tokenAddress: contractAddress,
      toAddress: address,
      amount: cellValueWithDecimals(getDigit(amount), asset!.decimals) as string,
      toChainId: chain.chainId,
      wallet: wallets[selectedWallet]
    })

    setLoading(false)
    setAmount('0')
    setAddress('')
    navigation.navigate('SuccessTx', {
      type: 'crosschainSwap',
      txHash: transactionHash,
      otherChainName: chain.name,
      otherChainLogo: chain.icon,
      swapAmount: getDigit(amount),
      tokenSymbol: asset!.symbol,
      otherChainReceiver: address,
    });
  }

  const getContractAddressFromKardiaChain = () => {
    if (!asset || !chain) return undefined
    const contractAddress = chain.bridgeContractAddress.fromKardiaChain
    if (!contractAddress) return undefined
    return contractAddress[asset.address]
  }

  const handleApprove = async () => {
    if (!asset) return
    try {
      setLoading(true)
      await approveKRC20Token(asset, wallets[selectedWallet], KAI_BRIDGE_ADDRESS!)
    } catch (error) {
      console.log('Approve error')
    }

    const _approveState = await getKRC20ApproveState(asset, getDigit(amount), wallets[selectedWallet], KAI_BRIDGE_ADDRESS)

    setApproveState(_approveState)
    setLoading(false)
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

  const renderLoadingConfig = () => {
    if (!asset) return null
    if (loadingLiquidity || loadingConfig) {
      return (
        <ActivityIndicator 
          color={theme.textColor}
          size="large"
        />
      )
    }
    return null
  }

  const renderButton = () => {
    if (!asset || !address) {
      return (
        <Button 
          title={getLanguageString(language, 'DUAL_NODE_CONVERT')}
          onPress={handleConvert}
          loading={loading}
          textStyle={
            {...getSemiBoldStyle(), ...{fontSize: theme.defaultFontSize + 4}}
          }
        />
      )
    }
    if (!approveState) {
      return (
        <Button 
          title={getLanguageString(language, 'APPROVE')}
          onPress={handleApprove}
          loading={loading}
          textStyle={
            {...getSemiBoldStyle(), ...{fontSize: theme.defaultFontSize + 4}}
          }
        />
      )
    }
    return (
      <Button 
        title={getLanguageString(language, 'DUAL_NODE_CONVERT')}
        onPress={handleConvert}
        loading={loading}
        textStyle={
          {...getSemiBoldStyle(), ...{fontSize: theme.defaultFontSize + 4}}
        }
      />
    )
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
      <ConfirmModal 
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        chain={chain}
        asset={asset}
        amount={amount}
        receiver={address}
        submitSwap={submitSwap}
        swapFee={swapFee}
      />
      <View 
        style={{flex: 1}}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <CustomText
            style={{
              color: theme.textColor,
              fontSize: theme.defaultFontSize + 24,
            }}
          >
            Dual Node
          </CustomText>
        </TouchableWithoutFeedback>
        <ScrollView
          style={{flex: 1}} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}
          refreshControl={
            <RefreshControl
              colors={[theme.textColor]}
              tintColor={theme.textColor}
              titleColor={theme.textColor}
              refreshing={reloadingLiquidity && reloadingBalance}
              onRefresh={handleRefresh}
            />
          }
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View
              style={{flex: 1}}
            >
              <NetworkSelector selectedChain={chain} onSelectChain={(newChain) => setChain(newChain)} />
              {chain && <AssetSelector asset={asset} selectAsset={setAsset} supportedAssets={chain.supportedAssets} errorAsset={errorAsset} />}
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
                  {chain && `${chain.supportedTokenStandard.join(', ')} address only`} 
                </CustomText>
              </View>
              {
                asset && !loadingLiquidity && 
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
                asset && chain && 
                <BalanceInput 
                  reloadingConfig={reloadConfig}
                  onReloadComplete={() => {
                    setReloadingLiquidity(false)
                  }}
                  amount={amount} 
                  setAmount={setAmount}
                  token={asset}
                  currentBalance={balance}
                  chain={chain}
                  errorAmount={errorAmount}
                  liquidity={liquidity}
                  setLiquidity={setLiquidity}
                  loadingLiquidity={loadingLiquidity}
                  setLoadingLiquidity={setLoadingLiquidity}
                  loadingConfig={loadingConfig}
                />
              }
              <Divider />
              {
                renderLoadingConfig()
              }
              {
                asset && chain &&
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
                  setErrorAsset={setErrorAsset}
                  loadingLiquidity={loadingLiquidity}
                  loadingConfig={loadingConfig}
                  setLoadingConfig={setLoadingConfig}
                />
              }
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <View style={{paddingBottom: 18}}>
          {renderButton()}
        </View>
      </View>
    </View>
  )
}