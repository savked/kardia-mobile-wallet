/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import Button from '../../components/Button';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getWalkThroughView, saveWalkThroughView } from '../../utils/local';
import WalkThrough from '../WalkThrough';
import { styles } from './style';

const Welcome = () => {
  const navigation = useNavigation();
  const language = useRecoilValue(languageAtom);
  const theme = useContext(ThemeContext);

  const [showWalkThrough, setShowWalkThrough] = useState(true);

  useEffect(() => {
    (async () => {
      // Get local walkthrough view
      const walkThroughViewed = await getWalkThroughView();
      setShowWalkThrough(!walkThroughViewed)
      // setShowWalkThrough(false);
    })()
  }, [])

  const submitWalkThrough = async () => {
    await saveWalkThroughView(true)
    setShowWalkThrough(false);
  }

  if (showWalkThrough) {
    return (
      <WalkThrough onSubmit={submitWalkThrough} />
    )
  }

  return (
    <SafeAreaView
      style={[
        styles.noWalletContainer,
        {backgroundColor: theme.backgroundColor},
      ]}>
      <View style={{flex: 4, alignItems: 'center', justifyContent: 'center'}}>
        <View style={{width: 188, height: 188, marginBottom: 58}}>
          <Image
            style={styles.noWalletLogo}
            source={require('../../assets/welcome_background.png')}
          />
        </View>
        <View>
          <CustomText
            style={{
              fontSize: 24,
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: 4,
              color: '#B4BDC9',
            }}>
            {getLanguageString(language, 'WELCOME')}
          </CustomText>
          <CustomText style={{fontSize: 14, color: '#B4BDC9', textAlign: 'center'}}>
            {getLanguageString(language, 'GETTING_STARTED_DESCRIPTION')}
          </CustomText>
        </View>
      </View>
      <View style={{flex: 1, justifyContent: 'space-evenly'}}>
        <Button
          title={getLanguageString(language, 'CREATE_NEW_WALLET')}
          type="outline"
          onPress={() => navigation.navigate('CreateWallet')}
          style={{width: 300}}
        />
        <Button
          title={getLanguageString(language, 'IMPORT_YOUR_WALLET')}
          type="primary"
          onPress={() => navigation.navigate('ImportWallet')}
        />
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
