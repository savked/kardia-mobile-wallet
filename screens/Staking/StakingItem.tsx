/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import numeral from 'numeral';
import {TouchableOpacity, View} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';
import {weiToKAI} from '../../services/transaction/amount';
import {
  getAllValidator,
  getValidatorCommissionRate,
} from '../../services/staking';
import {useRecoilValue} from 'recoil';
import {getLanguageString} from '../../utils/lang';
import {languageAtom} from '../../atoms/language';
import TextAvatar from '../../components/TextAvatar';
import DelegateDetailModal from '../common/DelegateDetailModal';
import CustomText from '../../components/Text';
import { getLatestBlock } from '../../services/blockchain';
import { formatNumberString, getDigit } from '../../utils/number';
import { BLOCK_TIME } from '../../config';

const StakingItem = ({
  item
}: {
  item: any;
}) => {
  const [showFull, setShowFull] = useState(false);
  const [commissionRate, setCommissionRate] = useState(0);
  const theme = useContext(ThemeContext);

  const claimableInKAI = weiToKAI(item.claimableRewards);
  const stakedAmountInKAI = weiToKAI(item.stakedAmount);

  const [totalStakedAmount, setTotalStakedAmount] = useState('');
  const [estimatedAPR, setEstimatedAPR] = useState('');

  const language = useRecoilValue(languageAtom);

  useEffect(() => {
    (async () => {
      try {
        const {totalStaked} = await getAllValidator();
        setTotalStakedAmount(totalStaked);
        // setValidatorList(validators);
        // setLoading(false);
      } catch (error) {
        console.error(error);
        // setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    calculateStakingAPR();
  }, [totalStakedAmount]);

  useEffect(() => {
    (async () => {
      const rate = await getValidatorCommissionRate(item.value);
      setCommissionRate(Number(rate) * 100);
    })();
  }, [item.value]);

  const getSelectedStakedAmount = () => {
    const formatted = numeral(weiToKAI(item.stakedAmount)).format(
      '0,0.00',
    );
    return formatted === 'NaN' ? '0 KAI' : `${formatted} KAI`;
  };

  const calculateStakingAPR = async () => {
    if (!item || !totalStakedAmount) {
      return;
    }
    try {
      const commission = Number(commissionRate) / 100;
      const votingPower = Number(weiToKAI(item.stakedAmount)) / Number(weiToKAI(totalStakedAmount));

      const block = await getLatestBlock();
      const blockReward = Number(weiToKAI(block.rewards));
      const delegatorsReward = blockReward * (1 - commission) * votingPower;

      const yourReward =
        (Number(getDigit(getSelectedStakedAmount())) / Number(weiToKAI(item.stakedAmount))) * delegatorsReward;
      
      // setEstimatedProfit(`${(yourReward * (30 * 24 * 3600)) / BLOCK_TIME}`);
      setEstimatedAPR(
        `${
          ((yourReward * (365 * 24 * 3600)) /
            BLOCK_TIME /
            Number(getDigit(getSelectedStakedAmount()))) *
          100
        }`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginVertical: 2,
        backgroundColor: theme.backgroundFocusColor,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <DelegateDetailModal
        validatorItem={{...item, ...{commissionRate}}}
        visible={showFull}
        onClose={() => setShowFull(false)}
      />
      <TouchableOpacity
        onPress={() => setShowFull(!showFull)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TextAvatar
            text={item.name}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            textStyle={{fontSize: 16}}
          />
          <View>
            <CustomText style={[styles.validatorName, {color: theme.textColor}]}>
              {item.name}
            </CustomText>
            <CustomText
              allowFontScaling={false}
              style={{
                fontSize: theme.defaultFontSize,
                color: 'rgba(252, 252, 252, 0.54)',
              }}>
              {getLanguageString(language, 'ESTIMATED_APR')}: {numeral(estimatedAPR).format('0,0.00')}{' '}%
            </CustomText>
          </View>
        </View>
        <View style={{alignItems: 'flex-end', justifyContent: 'space-between'}}>
          <View style={{justifyContent: 'center'}}>
            <CustomText
              allowFontScaling={false}
              style={{
                fontWeight: 'bold',
                color: theme.textColor,
                fontSize: theme.defaultFontSize + 1,
              }}>
              {/* {numeral(claimableInKAI).format('0,0.00')} KAI */}
              {formatNumberString(claimableInKAI, 3)} KAI
            </CustomText>
          </View>
          <View style={{justifyContent: 'center'}}>
            <CustomText
              allowFontScaling={false}
              style={{
                color: 'rgba(252, 252, 252, 0.54)',
                fontSize: theme.defaultFontSize,
              }}>
              {formatNumberString(stakedAmountInKAI, 3)} KAI
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default StakingItem;
