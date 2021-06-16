/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Dimensions, Image, Platform, View} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {useRecoilState, useRecoilValue} from 'recoil';
import {selectedWalletAtom, walletsAtom} from '../../atoms/wallets';
import {styles} from './style';
import {tokenInfoAtom} from '../../atoms/token';
import {languageAtom} from '../../atoms/language';
import {getLanguageString, parseCardAvatar} from '../../utils/lang';
import numeral from 'numeral';
import {weiToKAI} from '../../services/transaction/amount';
import {ThemeContext} from '../../ThemeContext';
import CustomText from '../../components/Text';
import Toast from 'react-native-toast-message';
import ControlSection from './ControlSection';

const {width: viewportWidth} = Dimensions.get('window');

const CardSliderSection = () => {
  const theme = useContext(ThemeContext);
  const carouselRef = useRef<Carousel<Wallet>>(null);
  const wallets = useRecoilValue(walletsAtom);
  const tokenInfo = useRecoilValue(tokenInfoAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );
  const language = useRecoilValue(languageAtom);

  const [snapTimeoutId, setSnapTimeoutId] = useState<any>()

  const renderWalletItem = ({item: wallet}: any) => {
    return (
      <View style={styles.kaiCardContainer}>
        <View style={styles.kaiCard}>
          <Image
            style={[styles.cardBackground, {width: viewportWidth - 40}]}
            source={parseCardAvatar(wallet.cardAvatarID)}
            // source={require('../../assets/test.jpg')}
          />
          <View
            style={{
              alignItems: 'center',
            }}>
            <CustomText allowFontScaling={false} style={{color: 'rgba(252, 252, 252, 0.54)', fontSize: theme.defaultFontSize}}>
              {getLanguageString(language, 'TOTAL_BALANCE').toUpperCase()}
            </CustomText>
            <CustomText allowFontScaling={false} style={Platform.OS === 'android' ? {fontSize: 24, color: theme.textColor, fontFamily: 'WorkSans-SemiBold'} : {fontSize: 24, color: theme.textColor, fontWeight: '500'}}>
              $
              {numeral(
                tokenInfo.price *
                  (Number(weiToKAI(wallet.balance)) + wallet.staked + wallet.undelegating),
              ).format('0,0.00')}
            </CustomText>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <ControlSection />
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <View>
              <CustomText style={Platform.OS === 'android' ? {fontSize: 15, color: 'rgba(252, 252, 252, 0.87)', fontFamily: 'WorkSans-SemiBold'} : {fontSize: 15, color: 'rgba(252, 252, 252, 0.87)', fontWeight: '500'}}>
                {wallet.name ? wallet.name.toUpperCase() : getLanguageString(language,'NEW_WALLET').toUpperCase()}
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (carouselRef.current && carouselRef.current.currentIndex !== selectedWallet) {

      if (snapTimeoutId) {
        clearTimeout(snapTimeoutId)
      }

      // react-native-snap-carousel issue. TODO: wait for issue resolved and update
      const snap = setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.snapToItem(selectedWallet);
          clearTimeout(snap)
          setSnapTimeoutId(undefined)
        }
      }, 300);

      setSnapTimeoutId(snap)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);


  return (
    <View style={styles.kaiCardSlider}>
      <Carousel
        ref={carouselRef}
        data={wallets}
        enableSnap={true}
        renderItem={renderWalletItem}
        sliderWidth={viewportWidth}
        itemWidth={viewportWidth - 40}
        onSnapToItem={setSelectedWallet}
        inactiveSlideScale={0.95}
      />
      <Pagination
        dotsLength={wallets.length}
        activeDotIndex={selectedWallet}
        containerStyle={{
          paddingVertical: 0,
          height: 6,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
        dotStyle={{
          width: 6,
          height: 6,
          borderRadius: 3,
          marginHorizontal: -8,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={1}
      />
    </View>
  );
};

export default CardSliderSection;
