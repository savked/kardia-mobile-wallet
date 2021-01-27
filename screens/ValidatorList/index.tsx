import {useNavigation} from '@react-navigation/native';
/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import List from '../../components/List';
import TextInput from '../../components/TextInput';
import {getAllValidator} from '../../services/staking';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {getDigit, isNumber} from '../../utils/number';
import {styles} from './style';

const ValidatorList = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  const [filterValidator, setFilterValidator] = useState('');
  const [validatorList, setValidatorList] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const {validators} = await getAllValidator();
      setValidatorList(validators);
      setLoading(false);
    })();
  }, []);

  const filter = (validator: Validator) => {
    if (filterValidator.length < 1) {
      return true;
    }
    if (validator.name.toLowerCase().includes(filterValidator.toLowerCase())) {
      return true;
    }
    if (isNumber(filterValidator)) {
      const _minCom = Number(getDigit(filterValidator));
      return Number(validator.commissionRate) >= _minCom;
    }
    return false;
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.controlContainer}>
        <TextInput
          block={true}
          placeholder={getLanguageString(
            language,
            'SEARCH_VALIDATOR_PLACEHOLDER',
          )}
          value={filterValidator}
          onChangeText={setFilterValidator}
        />
      </View>
      <View style={{flex: 1}}>
        {loading ? (
          <ActivityIndicator color={theme.textColor} size="large" />
        ) : (
          <List
            keyExtractor={(item) => item.smcAddress}
            items={validatorList.filter(filter)}
            render={(item: Validator, index) => {
              return (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('NewStaking', {
                      smcAddress: item.smcAddress,
                    })
                  }
                  style={[
                    styles.validatorItemContainer,
                    {
                      backgroundColor:
                        index % 2 === 0
                          ? theme.backgroundFocusColor
                          : theme.backgroundColor,
                    },
                  ]}>
                  <Text
                    style={{
                      color: theme.textColor,
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.textColor,
                      fontSize: 16,
                      fontStyle: 'italic',
                    }}>
                    {item.commissionRate} %
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

export default ValidatorList;
