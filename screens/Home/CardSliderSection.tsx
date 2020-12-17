/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {useRecoilState, useRecoilValue} from 'recoil';
import LinearGradient from 'react-native-linear-gradient';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/FontAwesome';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import Button from '../../components/Button';
import {parseKaiBalance} from '../../utils/number';
import {truncate} from '../../utils/string';
import {styles} from './style';
import {saveWallets} from '../../utils/local';
import {useNavigation} from '@react-navigation/native';
import {tokenInfoAtom} from '../../atoms/token';
import {languageAtom} from '../../atoms/language';
import {getLanguageString} from '../../utils/lang';

const {width: viewportWidth} = Dimensions.get('window');

const CardSliderSection = ({
  importWallet,
  showQRModal,
}: {
  importWallet: () => void;
  showQRModal: () => void;
}) => {
  const navigation = useNavigation();
  const carouselRef = useRef<Carousel<Wallet>>(null);
  const [wallets, setWallets] = useRecoilState(walletsAtom);
  const [tokenInfo] = useRecoilState(tokenInfoAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );
  const language = useRecoilValue(languageAtom);

  function send() {
    navigation.navigate('Transaction', {screen: 'CreateTx', initial: false});
  }

  const renderWalletItem = ({item: wallet, index}: any) => {
    return (
      <View style={styles.kaiCardContainer}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          colors={['#623555', '#e62c2c']}
          style={styles.kaiCard}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{paddingRight: 8, flex: 10}}>
              <Text style={styles.kaiCardText}>
                {getLanguageString(language, 'ADDRESS')}:
              </Text>
              <Text style={styles.kaiCardText}>
                {truncate(wallet.address, 8, 10)}
              </Text>
            </View>
            <Menu>
              <MenuTrigger
                customStyles={{
                  triggerOuterWrapper: {
                    width: 27,
                    height: 27,
                    alignItems: 'flex-end',
                  },
                  TriggerTouchableComponent: TouchableOpacity,
                  triggerWrapper: {
                    width: 27,
                    height: 27,
                    alignItems: 'flex-end',
                  },
                }}>
                <Icon name="cog" color="#FFFFFF" size={27} />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionWrapper: {padding: 18},
                }}>
                <MenuOption onSelect={() => removeWallet(index)}>
                  <Text>Remove wallet</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          <View>
            <Text style={{fontSize: 30, color: 'white'}}>
              ${parseKaiBalance(tokenInfo.price * wallet.balance)}
            </Text>
            <Image
              style={styles.cardLogo}
              source={require('../../assets/kar1.png')}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.kaiCardText, styles.kaiCardBalanceText]}>
              {parseKaiBalance(wallet.balance)} KAI
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const removeWallet = async (walletIndex: number) => {
    let hack = false;
    const newWallets: Wallet[] = JSON.parse(JSON.stringify(wallets));
    newWallets.splice(walletIndex, 1);
    await saveWallets(newWallets);
    if (selectedWallet > newWallets.length - 1) {
      hack = true;
      newWallets.length - 1 >= 0 && setSelectedWallet(newWallets.length - 1);
    }
    setWallets(newWallets);

    // Carousel hack
    setTimeout(() => {
      if (carouselRef.current && hack) {
        carouselRef.current.triggerRenderingHack();
      }
    }, 1);
  };

  return (
    <View style={styles.kaiCardSlider}>
      <Carousel
        ref={carouselRef}
        data={wallets}
        enableSnap={true}
        renderItem={renderWalletItem}
        sliderWidth={viewportWidth}
        itemWidth={viewportWidth}
        onSnapToItem={setSelectedWallet}
      />
      <Pagination
        dotsLength={wallets.length}
        activeDotIndex={selectedWallet}
        containerStyle={{
          paddingVertical: 0,
          height: 20,
          justifyContent: 'center',
        }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />

      <View style={styles.buttonGroupContainer}>
        <Button
          title={getLanguageString(language, 'SEND')}
          type="outline"
          onPress={send}
          iconName="paper-plane"
          size="small"
          textStyle={{color: '#FFFFFF'}}
          style={{marginRight: 5}}
        />

        <Button
          onPress={showQRModal}
          title={getLanguageString(language, 'RECEIVE')}
          size="small"
          type="outline"
          iconName="download"
          style={{marginLeft: 5, marginRight: 5}}
          textStyle={{color: '#FFFFFF'}}
        />

        <Button
          title={getLanguageString(language, 'IMPORT')}
          onPress={importWallet}
          type="outline"
          iconName="plus"
          size="small"
          style={{marginLeft: 5}}
          textStyle={{color: '#FFFFFF'}}
        />
      </View>
    </View>
  );
};

export default CardSliderSection;
