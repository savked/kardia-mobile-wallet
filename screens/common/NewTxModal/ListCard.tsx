/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {ThemeContext} from '../../../ThemeContext';
import {languageAtom} from '../../../atoms/language';
import {getLanguageString} from '../../../utils/lang';
import {styles} from './style';

const ListCard = ({
  gasPrice,
  selectGasPrice,
}: {
  gasPrice: number;
  selectGasPrice: (gasPrice: number) => void;
}) => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);

  const data = [
    {
      title: getLanguageString(language, 'SLOW_SPEED'),
      time: `~5 ${getLanguageString(language, 'SECOND')}`,
      gasPrice: 1,
    },
    {
      title: getLanguageString(language, 'AVERAGE_SPEED'),
      time: `~3 ${getLanguageString(language, 'SECOND')}`,
      gasPrice: 2,
    },
    {
      title: getLanguageString(language, 'FAST_SPEED'),
      time: `~1 ${getLanguageString(language, 'SECOND')}`,
      gasPrice: 3,
    },
  ];

  return (
    <View style={styles.listCard}>
      {data.map((item, index) => {
        const active = item.gasPrice === gasPrice;
        return (
          <TouchableOpacity
            key={`tx-speed-${index}`}
            onPress={() => selectGasPrice(item.gasPrice)}
            style={{
              backgroundColor: active ? theme.primaryColor : '#dbdbdb',
              padding: 20,
              borderRadius: 8,
              width: '30%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: active ? theme.primaryTextColor : theme.ghostTextColor,
              }}>
              {item.title}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: active ? theme.primaryTextColor : theme.ghostTextColor,
              }}>
              {item.time}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ListCard;
