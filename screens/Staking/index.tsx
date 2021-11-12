/* eslint-disable react-native/no-inline-styles */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BigNumber } from "bignumber.js";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntIcon from 'react-native-vector-icons/AntDesign';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { languageAtom } from '../../atoms/language';
import { showTabBarAtom } from '../../atoms/showTabBar';
import { statusBarColorAtom } from '../../atoms/statusBar';
import { selectedWalletAtom, walletsAtom } from '../../atoms/wallets';
import AlertModal from '../../components/AlertModal';
import Button from '../../components/Button';
import List from '../../components/List';
import CustomText from '../../components/Text';
import { getCurrentStaking, mapValidatorRole } from '../../services/staking';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getSelectedWallet, getWallets } from '../../utils/local';
import { formatNumberString } from '../../utils/number';
import StakingItem from './StakingItem';
import { styles } from './style';

const {width: viewportWidth} = Dimensions.get('window');

const StakingScreen = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const selectedWallet = useRecoilValue(selectedWalletAtom);
  const wallets = useRecoilValue(walletsAtom);
  const navigation = useNavigation();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);

  const [currentStaking, setCurrentStaking] = useState<Staking[]>([]);
  const [undelegatingIndex, setUndelegatingIndex] = useState(-1);
  // const [focusingItem, setFocusingItem] = useState(-1);
  const setStatusBarColor = useSetRecoilState(statusBarColorAtom);
  const setTabBarVisible = useSetRecoilState(showTabBarAtom);

  const getStakingData = async () => {
    const localWallets = await getWallets();
    const localSelectedWallet = await getSelectedWallet();
    if (
      !localWallets[localSelectedWallet] ||
      !localWallets[localSelectedWallet].address
    ) {
      return;
    }
    try {
      const _staking = await getCurrentStaking(
        localWallets[localSelectedWallet].address,
      );
      setCurrentStaking(_staking);
      if (loading === true) {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      if (loading === true) {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      getStakingData();
      setTabBarVisible(true);
      // TODO: Update after designer finish
      setStatusBarColor(theme.backgroundColor);
      return () => {
        setStatusBarColor(theme.backgroundColor);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (message !== '' || undelegatingIndex >= 0) {
      setStatusBarColor(theme.backgroundColor);
    } else {
      setStatusBarColor(theme.backgroundColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undelegatingIndex, message]);

  useEffect(() => {
    getStakingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selectedWallet, wallets]);

  const parseStakingItemForList = (item: Staking) => {
    return {
      label: item.validatorContractAddr,
      value: item.validatorContractAddr,
      name: item.name,
      stakedAmount: item.stakedAmount,
      claimableRewards: item.claimableRewards,
      withdrawableAmount: item.withdrawableAmount,
      unbondedAmount: item.unbondedAmount,
      role: mapValidatorRole(item.validatorRole),
      unbondedRecords: item.unbondedRecords
    };
  };

  const getTotalSaving = () => {
    const rs = currentStaking.reduce((total, item) => {
      return total.plus(new BigNumber(item.claimableRewards));
    }, new BigNumber(0));
    return rs.dividedBy(new BigNumber(10 ** 18)).toFixed()
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.header}>
        <CustomText style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'STAKING_TITLE')}
        </CustomText>
      </View>
      {currentStaking.length > 0 && (
        <ImageBackground
          source={require('../../assets/staking_background.png')}
          imageStyle={{
            resizeMode: 'cover',
            width: viewportWidth - 40,
            height: 172,
            borderRadius: 12,
          }}
          style={{
            width: viewportWidth - 40,
            height: 172,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingVertical: 32,
          }}>
          <CustomText
            allowFontScaling={false}
            style={[
              styles.sectionTitle,
              {color: theme.textColor, textAlign: 'center', fontWeight: '500'},
              {fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}
            ]}>
            {getLanguageString(language, 'TOTAL_EARNING')}
          </CustomText>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <CustomText style={[styles.totalSaving, Platform.OS === 'android' ? {color: theme.textColor, fontFamily: 'WorkSans-SemiBold'} : {color: theme.textColor, fontWeight: '500'}]}>
              {formatNumberString(getTotalSaving(), 2)} KAI
            </CustomText>
            <CustomText style={{fontSize: theme.defaultFontSize + 6, color: 'rgba(252, 252, 252, 0.54)', fontWeight: '500', fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined}}>
              KAI
            </CustomText>
          </View>
        </ImageBackground>
      )}
      {currentStaking.length > 0 && (
        <CustomText
          style={[
            styles.sectionTitle,
            {
              color: theme.textColor,
              // paddingHorizontal: 14,
              paddingVertical: 20,
            },
          ]}>
          {getLanguageString(language, 'YOUR_INVESTMENTS')}
        </CustomText>
      )}
      <List
        loading={loading}
        loadingColor={theme.primaryColor}
        items={currentStaking.map(parseStakingItemForList)}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 27,
            }}>
            <Image
              style={{width: 320, height: 320}}
              source={require('../../assets/icon/no_staking.png')}
            />
            <CustomText style={{color: theme.textColor, fontSize: 24, fontWeight: 'bold', marginBottom: 8, marginTop: 100}}>
              {getLanguageString(language, 'NO_STAKING')}
            </CustomText>
            <CustomText style={[styles.noStakingText, {color: theme.mutedTextColor, textAlign: 'center', marginBottom: 32, lineHeight: 26}]}>
              {getLanguageString(language, 'NO_STAKING_ITEM')}
            </CustomText>
            <Button
              type="primary"
              onPress={() => navigation.navigate('ValidatorList')}
              title={getLanguageString(language, 'STAKE_NOW')}
              textStyle={{
                fontWeight: '500', 
                fontSize: theme.defaultFontSize + 3,
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined
              }}
              style={{width: 248}}
              icon={
                <AntIcon
                  name="plus"
                  size={20}
                  color={'#000000'}
                  style={{marginRight: 8}}
                />
              }
            />
          </View>
        }
        render={(item, index) => {
          return (
            <StakingItem
              item={item}
            />
          );
        }}
        ItemSeprator={() => <View style={{height: 6}} />}
      />
      {currentStaking.length > 0 && (
        <Button
          type="primary"
          icon={<AntIcon name="plus" size={24} />}
          size="small"
          onPress={() => navigation.navigate('ValidatorList')}
          style={styles.floatingButton}
        />
      )}
      {message !== '' && (
        <AlertModal
          type={messageType as any}
          message={message}
          onClose={() => {
            setMessage('');
            if (messageType === 'success') {
              getStakingData();
            }
          }}
          visible={true}
        />
      )}
    </SafeAreaView>
  );
};

export default StakingScreen;
