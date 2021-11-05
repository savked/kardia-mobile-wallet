import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, Image, ImageBackground, Keyboard, Platform, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ENIcon from 'react-native-vector-icons/Entypo';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { filterByOwnerSelector, krc20PricesAtom } from '../../atoms/krc20';
import { languageAtom } from '../../atoms/language';
import { pendingTxSelector } from '../../atoms/pendingTx';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { tokenInfoAtom } from '../../atoms/token';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import CustomText from '../../components/Text';
import CustomTextInput from '../../components/TextInput';
import { getBalance } from '../../services/krc20';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString, parseCardAvatar, parseCardAvatarColor } from '../../utils/lang';
import { getSelectedWallet, getWallets, saveWallets } from '../../utils/local';
import { parseDecimals } from '../../utils/number';
import QRModal from '../common/AddressQRCode';
import AuthModal from '../common/AuthModal';
import CardItem from '../Home/CardItem';
import { styles } from './style';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window')

export default () => {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);

  const scrollRef = useRef<ScrollView>(null);

  const setTabBarVisible = useSetRecoilState(showTabBarAtom);
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(selectedWalletAtom);
  const [pendingTx, setPendingTx] = useRecoilState(pendingTxSelector(wallets[selectedWallet].address))
  const language = useRecoilValue(languageAtom);
  const tokenInfo = useRecoilValue(tokenInfoAtom);

  const [showQRModal, setShowQRModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showCardTypeModal, setShowCardTypeModal] = useState(false);
  const [requestAuth, setRequestAuth] = useState(false);

  const { params } = useRoute();
  const address = params ? (params as any).address : ''
  const wallet = wallets.find((w) => w.address === address);

  const [name, setName] = useState(wallet ? wallet.name : '');
  const [cardAvatarID, setCardAvatarID] = useState(wallet ? wallet.cardAvatarID : 1);

  const krc20Prices = useRecoilValue(krc20PricesAtom);;
  const tokenList = useRecoilValue(filterByOwnerSelector(wallets[selectedWallet].address))
  const [KRC20Balance, setKRC20Balance] = useState(0)

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
		(async () => {
			const promiseArr = tokenList.map((i) => {
				return getBalance(i.address, wallets[selectedWallet].address);
			});
			const balanceArr = await Promise.all(promiseArr);

			const _krc20Balance = tokenList.reduce((accumulator, currentValue, index) => {
				const price = krc20Prices[currentValue.address] ? Number(krc20Prices[currentValue.address].price) : 0
				const decimalValue = parseDecimals(balanceArr[index], currentValue.decimals)
				return accumulator + Number(decimalValue) * price
			}, 0)
	
			setKRC20Balance(_krc20Balance);
		})()
  }, [tokenList, selectedWallet]);

  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      scrollRef!.current!.scrollTo({
        x: 193 * (cardAvatarID || 0),
        y: 0,
        animated: false,
      })
    }

    const onBackPress = () => {
      saveWallet()
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);

  }, []);

  if (!wallet) {
    return null;
  }

  const getAddressCardAvatar = () => {
    const walletItem = wallets.find((w) => w.address === address)
    if (!walletItem) {
      return parseCardAvatar(0);
    }
    return parseCardAvatar(cardAvatarID || 0);
  }

  const removeWallet = async () => {
    const localWallets = await getWallets();
    const localSelectedWallet = await getSelectedWallet();
    let newWallets: Wallet[] = JSON.parse(JSON.stringify(localWallets));
    newWallets = newWallets.filter((w) => w.address !== address)
    if (newWallets.length === 0) {
      // await saveSelectedWallet(0);
      setSelectedWallet(0);
    } else if (localSelectedWallet > newWallets.length - 1) {
      // await saveSelectedWallet(newWallets.length - 1);
      setSelectedWallet(newWallets.length - 1);
    }
    await saveWallets(newWallets)
    navigation.goBack();
    setWallets(newWallets);
  };

  const saveWallet = async () => {
    const localWallets = await getWallets();
    let newWallets: Wallet[] = JSON.parse(JSON.stringify(localWallets));

    const index = newWallets.findIndex(w => w.address === address)
    newWallets[index].name = name;
    newWallets[index].cardAvatarID = cardAvatarID;
    await saveWallets(newWallets)
    setWallets(newWallets);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor, flex: 1, justifyContent: 'flex-start' }]}>
      <QRModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
      <AuthModal
        visible={requestAuth}
        onClose={() => {
          setRequestAuth(false);
        }}
        onSuccess={() => {
          setRequestAuth(false);
          navigation.navigate('MnemonicPhraseSetting', {
            wallet
          })
        }}
      />
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
        }}>
        <ENIcon.Button
          name="chevron-left"
          onPress={saveWallet}
          backgroundColor="transparent"
          style={{ padding: 0, marginBottom: 18 }}
        />
        <TouchableOpacity onPress={() => setShowRemoveConfirm(true)}>
          <Image
            source={require('../../assets/icon/trash_dark.png')}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
      </View>
      <View style={{flex: 1 }}>
        <ScrollView 
          // showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ justifyContent: 'flex-start' }}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ paddingHorizontal: 20 }}>
              <CardItem wallet={wallet} noAction={true} cardId={cardAvatarID} />
              <CustomText style={{ color: theme.textColor, fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>
                {getLanguageString(language, 'WALLET_DETAILS')}
              </CustomText>
              <CustomTextInput
                headline={getLanguageString(language, 'WALLET_CARD_NAME')}
                value={name}
                onChangeText={setName}
                headlineStyle={{ marginTop: 16, fontWeight: 'normal', color: theme.textColor }}
                inputStyle={{ marginTop: 6, backgroundColor: 'rgba(96, 99, 108, 1)', color: theme.textColor, borderColor: 'rgba(154, 163, 178, 1)', borderWidth: 1.5 }}
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <CustomText style={{ marginTop: 16, marginBottom: 8, fontWeight: 'normal', color: theme.textColor, paddingHorizontal: 20 }}>{getLanguageString(language, 'WALLET_CARD_TYPE')}</CustomText>
          </TouchableWithoutFeedback>
          <View>
            <ScrollView showsHorizontalScrollIndicator={false} horizontal ref={scrollRef}>
              {[0, 1, 2, 3, 4, 5].map((item, index) => {
                return (
                  <TouchableOpacity key={`card-${index}`} onPress={() => setCardAvatarID(index)}>
                    <ImageBackground
                      imageStyle={{
                        resizeMode: 'cover',
                        width: 189,
                        height: 117,
                        borderRadius: 12,
                      }}
                      style={{
                        marginLeft: index === 0 ? 20 : 16,
                        marginRight: index === 5 ? 20 : 0,
                        width: 193,
                        height: 121,
                        borderRadius: 14,
                        justifyContent: 'flex-end',
                        padding: 12,
                        borderColor: item === cardAvatarID ? theme.textColor : 'transparent',
                        borderWidth: 2,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        shadowOffset: {
                          width: 0,
                          height: -4,
                        },
                        shadowOpacity: 2,
                        shadowRadius: 4,
                        elevation: 9,
                      }} source={parseCardAvatar(item || 0)}>
                      <CustomText style={{ fontSize: 14, color: theme.textColor }}>{parseCardAvatarColor(item || 0)}</CustomText>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <CustomText style={{ color: theme.textColor, paddingHorizontal: 20, fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>
            {getLanguageString(language, 'WALLET_SECURITY')}
          </CustomText>
          <TouchableOpacity style={{
            marginHorizontal: 20,
            backgroundColor: theme.backgroundFocusColor,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center'
          }}
            onPress={() => setRequestAuth(true)}
          >
            <View style={{flex: 1}}>
              <CustomText style={{color: theme.textColor, marginBottom: 12, fontSize: theme.defaultFontSize + 3}}>
                {getLanguageString(language, 'WALLET_CREDENTIAL')}
              </CustomText>
              <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize}}>
                {getLanguageString(language, 'REVEAL_DESC')}
              </CustomText>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}> 
              <ENIcon
                color={theme.textColor}
                size={24}
                name="chevron-right"
                style={{padding: 0}}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Modal
        visible={showRemoveConfirm}
        showCloseButton={false}
        onClose={() => setShowRemoveConfirm(false)}
        contentStyle={{
          backgroundColor: theme.backgroundFocusColor,
          height: 540,
          justifyContent: 'center',
        }}>
        <Image
          style={{ width: 224, height: 145 }}
          source={require('../../assets/confirm_remove_wallet.png')}
        />
        <CustomText
          style={{
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 12,
            color: theme.textColor,
          }}>
          {getLanguageString(language, 'CONFIRM_REMOVE_TITLE')}
        </CustomText>
        <CustomText
          style={{
            textAlign: 'center',
            fontSize: 15,
            marginBottom: 36,
            color: theme.mutedTextColor,
            lineHeight: 26
          }}>
          {getLanguageString(language, 'CONFIRM_REMOVE_WALLET')}
        </CustomText>
        <Button
          block
          title={getLanguageString(language, 'KEEP_IT')}
          type="outline"
          textStyle={{
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontSize: theme.defaultFontSize + 3
          }}
          onPress={() => setShowRemoveConfirm(false)}
        />
        <Button
          block
          title={getLanguageString(language, 'DELETE_NOW')}
          type="ghost"
          style={{
            marginTop: 12,
            backgroundColor: 'rgba(208, 37, 38, 1)',
          }}
          textStyle={{
            color: '#FFFFFF',
            fontWeight: '500',
            fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
            fontSize: theme.defaultFontSize + 3
          }}
          onPress={removeWallet}
        />
      </Modal>
    </SafeAreaView>
  );
};
