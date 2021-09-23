import React, {useContext} from 'react';
import {View} from 'react-native';
import List from '../../components/List';
import CustomText from '../../components/Text';
import {ThemeContext} from '../../ThemeContext';
import {styles} from './style';

const INFO_DATA = [
  {
    label: 'Version',
    value: '1.2.3',
  },
];

const Info = () => {
  const theme = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <List
        items={INFO_DATA}
        render={(item) => {
          return (
            <View style={styles.settingItem}>
              <CustomText style={[styles.settingItemTitle, {color: theme.textColor}]}>
                {item.label}
              </CustomText>
              <CustomText style={[styles.settingItemTitle, {color: theme.textColor}]}>
                {item.value}
              </CustomText>
            </View>
          );
        }}
      />
    </View>
  );
};

export default Info;
