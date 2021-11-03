/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import RNRestart from 'react-native-restart';
import FontAwesome from 'react-native-vector-icons/Ionicons';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
// some button component
import Button from '../../components/Button';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
// some stylesheet
import { styles } from './style';

class ErrorBoundary extends React.Component<any, any> {
  static contextType = ThemeContext;
  state = {
    error: false,
  };

  static getDerivedStateFromError(error: any) {
    console.error(error);
    return {error: true};
  }

  clearData = async () => {
    // Clear local data that cause error
    // Restart app
    RNRestart.Restart();
  };

  render() {
    const theme = this.context;
    const {language} = this.props;

    if (this.state.error) {
      return (
        <SafeAreaView
          style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
          <View style={styles.container}>
            <CustomText style={{width: '100%'}}>
              <FontAwesome
                name="ios-information-circle-outline"
                size={60}
                color={theme.textColor}
              />
            </CustomText>
            <CustomText style={{fontSize: 32, color: theme.textColor}}>
              {getLanguageString(language, 'ERROR_BOUNDARY_TITLE')}
            </CustomText>
            <CustomText
              allowFontScaling={false}
              style={{
                marginVertical: 10,
                lineHeight: 23,
                fontWeight: '500',
                color: theme.textColor,
              }}>
              {getLanguageString(language, 'ERROR_BOUNDARY_DESCRIPTION')}
            </CustomText>
            <Button
              title={'Go back'}
              onPress={() => this.clearData()}
              style={{
                marginVertical: 15,
              }}
            />
          </View>
        </SafeAreaView>
      );
    } else {
      return this.props.children;
    }
  }
}

const ErrorBoundaryRecoilWrapper = ({children}: any) => {
  const language = useRecoilValue(languageAtom);
  return <ErrorBoundary language={language}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryRecoilWrapper;
