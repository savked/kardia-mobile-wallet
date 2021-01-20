/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import numeral from 'numeral';
import {Text, View} from 'react-native';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';
import {weiToKAI} from '../../services/transaction/amount';
import IconButton from '../../components/IconButton';
import Button from '../../components/Button';

const StakingItem = ({item}: {item: any}) => {
  const [showFull, setShowFull] = useState(false);
  const theme = useContext(ThemeContext);

  const claimableInKAI = weiToKAI(item.claimableRewards);
  const withDrawbleInKAI = weiToKAI(item.withdrawableAmount);
  const unbondedInKAI = weiToKAI(item.unbondedAmount);

  return (
    <View
      style={{
        padding: 15,
        height: showFull ? 210 : 140,
        marginVertical: 12,
        backgroundColor: theme.secondaryColor,
        borderRadius: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View>
        <Text style={styles.validatorName}>
          {item.name} ({item.role})
        </Text>
        <Text>
          Claimable KAI:{' '}
          <Text style={{fontWeight: 'bold'}}>
            {numeral(claimableInKAI).format('0,0.00')}
          </Text>
        </Text>
        <Text>
          Unbonded KAI:{' '}
          <Text style={{fontWeight: 'bold'}}>
            {numeral(unbondedInKAI).format('0,0.00')}
          </Text>
        </Text>
        <Text>
          Withdrawable KAI:{' '}
          <Text style={{fontWeight: 'bold'}}>
            {numeral(withDrawbleInKAI).format('0,0.00')}
          </Text>
        </Text>
        {showFull && (
          <View style={styles.actionContainer}>
            <Button
              style={{marginRight: 12}}
              title="Claim"
              type="primary"
              size="small"
              onPress={() => {}}
            />
            <Button
              title="Undelegated"
              type="ghost"
              size="small"
              onPress={() => {}}
            />
          </View>
        )}
      </View>
      <View>
        <IconButton
          name={showFull ? 'chevron-up' : 'chevron-down'}
          size={22}
          style={{
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setShowFull(!showFull)}
        />
      </View>
    </View>
  );
};

export default StakingItem;
