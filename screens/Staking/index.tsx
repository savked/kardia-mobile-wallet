import React, {useContext} from 'react';
import {Text, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../atoms/language';
import {ThemeContext} from '../../ThemeContext';
import {getLanguageString} from '../../utils/lang';
import {styles} from './style';

const StakingScreen = () => {
  const theme = useContext(ThemeContext);
  const language = useRecoilValue(languageAtom);
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <View style={styles.header}>
        <Text style={[styles.headline, {color: theme.textColor}]}>
          {getLanguageString(language, 'STAKING_SCREEN_TITLE')}
        </Text>
      </View>
    </View>
  );
};

export default StakingScreen;
