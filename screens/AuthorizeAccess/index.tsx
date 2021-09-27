import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { languageAtom } from '../../atoms/language'
import { showTabBarAtom } from '../../atoms/showTabBar'
import { statusBarColorAtom } from '../../atoms/statusBar'
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets'
import Button from '../../components/Button'
import SelectModal from '../../components/SelectModal'
import CustomText from '../../components/Text'
import { getVerifiedAppSchema } from '../../services/kardiaConnect'
import { ThemeContext } from '../../ThemeContext'
import { signMessage } from '../../utils/blockchain'
import { getApproveMessage } from '../../utils/kardiaConnect'
import { getLanguageString } from '../../utils/lang'
import { truncate } from '../../utils/string'
import { getSemiBoldStyle } from '../../utils/style'

export default () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  const {params}: any = useRoute()

  const [appName, setAppName] = useState('')
  const [appLogo, setAppLogo] = useState('')

  const wallets = useRecoilValue(walletsAtom)
  const [selectedWallet, setSelectedWallet] = useRecoilState(selectedWalletAtom)

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setStatusBarColor(theme.backgroundColor);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!params) return;

    const verifiedList = getVerifiedAppSchema()

    const item = verifiedList.find((i) => i.schema === params.callbackSchema)
    if (!item) {
      setAppName(appName)
    } else {
      setAppName(item.name)
      setAppLogo(item.logo)
    }
  }, [params])

  const getResponseURL = () => {
    if (!params) return;
    return `${params.callbackSchema}://${params.callbackPath}`
  }

  const approveAccess = () => {
    if (!wallets || !wallets[selectedWallet]) return;
    const message = getApproveMessage(params.callbackSchema || '')
    console.log(message)
    const signature = signMessage(message, wallets[selectedWallet].privateKey!)
    console.log('signature', signature)
    const url = `${getResponseURL()}/approve/${wallets[selectedWallet].address}/${signature}`
    console.log(url)
    console.log(JSON.stringify({
      to: '0x01B3232Bc2AdfBa8c39Ba4A4002924d62e39aE5d',
      value: '1000000000000000000',
      gas: 50000,
      gasPrice: 1000000000
    }))
  }

  const rejectAccess = () => {
    const url = `${getResponseURL()}/reject`
    console.log(url)
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
      }}
    >
      <CustomText
        style={[{
          color: theme.textColor,
          fontSize: theme.defaultFontSize + 20
        }, getSemiBoldStyle()]}
      >
        Authorize access
      </CustomText>
      <Image 
        source={appLogo !== '' ? {uri: appLogo} : require('../../assets/logo.png')}
        style={{
          width: 100,
          height: 100,
          resizeMode: 'contain',
          marginVertical: 20
        }}
      />
      <CustomText
        style={{
          color: theme.textColor,
          fontSize: theme.defaultFontSize + 4,
          textAlign: 'center',
          marginHorizontal: 20,
          marginBottom: 12
        }}
      >
        <CustomText style={getSemiBoldStyle()}>{appName}</CustomText>{' '}
        want to use your wallet for their blockchain transaction
      </CustomText>
      <View style={{alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 46}}>
        <SelectModal 
          searchPlaceHolder={getLanguageString(language, 'SEARCH_FOR_ADDRESS')}
          value={wallets[selectedWallet]}
          item={wallets}
          onSelect={(selectedWallet: Wallet) => {
            const index = wallets.findIndex((w) => w.address === selectedWallet.address)
            setSelectedWallet(index)
          }}
          renderItem={(item: Wallet, index) => {
            return (
              <View 
                key={`wallet-${index}`}
                style={{
                  padding: 20
                }}
              >
                <CustomText 
                  style={{
                    ...{
                      color: theme.textColor,
                      fontSize: theme.defaultFontSize + 3
                    },
                    ...getSemiBoldStyle()
                  }}
                >
                  {truncate(item.address, 15, 15)}
                </CustomText>
              </View>
            )
          }}
          renderSelected={(item: Wallet) => {
            return (
              <CustomText 
                style={{
                  ...{
                    color: theme.textColor,
                    fontSize: theme.defaultFontSize + 3
                  },
                  ...getSemiBoldStyle()
                }}
              >
                {truncate(item.address, 10, 10)}
              </CustomText>
            )
          }}
        />
      </View>
      <View style={{alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 40, marginTop: 40,}}>
        <Button 
          title={'Reject'}
          type="outline"
          textStyle={getSemiBoldStyle()}
          block
          onPress={rejectAccess}
        />
        <Button 
          style={{
            marginTop: 12,
          }}
          textStyle={getSemiBoldStyle()}
          title={'Approve'}
          onPress={approveAccess}
        />
      </View>
    </SafeAreaView>
  )
}