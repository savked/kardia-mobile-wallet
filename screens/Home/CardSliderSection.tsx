/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import CardItem from './CardItem';
import { styles } from './style';

const { width: viewportWidth } = Dimensions.get('window');

const CardSliderSection = ({ hideBalance, onHideBalanceClick }: {
  hideBalance: boolean,
  onHideBalanceClick: () => void
}) => {
  const carouselRef = useRef<Carousel<Wallet>>(null);
  const wallets = useRecoilValue(walletsAtom);
  const [selectedWallet, setSelectedWallet] = useRecoilState(
    selectedWalletAtom,
  );

  const [snapTimeoutId, setSnapTimeoutId] = useState<any>()

  const renderWalletItem = ({ item: wallet }: any) => {
    return <CardItem wallet={wallet} hideBalance={hideBalance}
      onHideBalanceClick={() => onHideBalanceClick()} />
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
