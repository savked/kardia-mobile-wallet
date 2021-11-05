import numeral from 'numeral';
import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import CustomText from '../../components/Text';
import TextAvatar from '../../components/TextAvatar';
import { BLOCK_TIME } from '../../config';
import { getLatestBlock } from '../../services/blockchain';
import { getAllValidator } from '../../services/staking';
import { weiToKAI } from '../../services/transaction/amount';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getDigit } from '../../utils/number';
import { styles } from './style';

export default ({item, onSelect}: {item: Validator, onSelect: (item: Validator) => void}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom);

  const [totalStakedAmount, setTotalStakedAmount] = useState('');
  const [estimatedAPR, setEstimatedAPR] = useState('');

  useEffect(() => {
    calculateStakingAPR();
  }, [totalStakedAmount]);

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
      const commission = Number(item.commissionRate) / 100;
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

  return (
    <TouchableOpacity
      onPress={() =>
        // navigation.navigate('NewStaking', {
        //   smcAddress: item.smcAddress,
        // })
        onSelect(item)
      }
      style={[
        styles.validatorItemContainer,
        {
          backgroundColor: theme.backgroundFocusColor,
        },
      ]}>
      <TextAvatar
        text={item.name}
        style={{
          width: 32,
          height: 32,
          borderRadius: 12,
          marginRight: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        textStyle={{fontSize: 16}}
      />
      <View style={{justifyContent: 'space-between'}}>
        <CustomText
          style={{
            color: theme.textColor,
            fontSize: 13,
            fontWeight: 'bold',
          }}>
          {item.name}
        </CustomText>
        <View style={{flexDirection: 'row'}}>
          <CustomText style={{color: theme.mutedTextColor, fontSize: theme.defaultFontSize,}}>
            {getLanguageString(language, 'ESTIMATED_APR')}:{' '}
          </CustomText>
          <CustomText
            style={{
              color: theme.mutedTextColor,
              fontSize: theme.defaultFontSize,
            }}>
            {numeral(estimatedAPR).format('0,0.00')}{' '}%
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  )
};