import React, { useContext } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../../atoms/language';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { getLanguageString } from '../../../utils/lang';
import { styles } from './style';

const WIDTH_HEIGHT_RATIO = 414 / 330;

const {width: viewportWidth} = Dimensions.get('window')

export default () => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)
  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor, justifyContent: 'center'}]}>
      <View style={{alignItems: 'center'}}>
        <Image
          source={require('../../../assets/under_maintainence.png')}
          style={{
            width: 345.42,
            height: 204.3
          }}
        />
      </View>
      <CustomText 
        style={{
          color: theme.textColor,
          fontWeight: 'bold',
          fontSize: 24,
          lineHeight: 32,
          textAlign: 'center',
          marginTop: 62
        }}
      >
        Under Maintainence
      </CustomText>
      <CustomText
        style={{
          color: theme.mutedTextColor,
          fontSize: theme.defaultFontSize + 3,
          lineHeight: 26,
          textAlign: 'center',
        }}
      >
        {getLanguageString(language, 'UNDER_MAINTAINENCE_DESC')}
      </CustomText>
    </SafeAreaView>
  );
};