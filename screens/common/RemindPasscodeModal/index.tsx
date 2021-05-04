/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Dimensions, Text, View} from 'react-native';
import {useRecoilValue} from 'recoil';
import {languageAtom} from '../../../atoms/language';
import Button from '../../../components/Button';
import CustomModal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import {getLanguageString} from '../../../utils/lang';

const {height: viewportHeight} = Dimensions.get('window');

const RemindPasscodeModal = ({
  visible,
  onClose,
  enablePasscode,
}: {
  visible: boolean;
  onClose: () => void;
  enablePasscode: () => void;
}) => {
  const language = useRecoilValue(languageAtom);
  return (
    <CustomModal
      showCloseButton={false}
      contentStyle={{
        flex: 0.3,
        marginTop: viewportHeight / 3,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        marginHorizontal: 14,
      }}
      visible={visible}
      onClose={onClose}>
      <CustomText>{getLanguageString(language, 'NO_PASSCODE')}</CustomText>
      <CustomText>{getLanguageString(language, 'PASSCODE_DESCRIPTION')}</CustomText>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-evenly',
        }}>
        <Button
          type="ghost"
          size="large"
          title={getLanguageString(language, 'LATER')}
          onPress={onClose}
        />
        <Button
          type="primary"
          size="large"
          title={getLanguageString(language, 'SET_APP_PASSCODE')}
          onPress={enablePasscode}
        />
      </View>
    </CustomModal>
  );
};

export default RemindPasscodeModal;
