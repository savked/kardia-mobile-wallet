import React, { useContext, useState } from 'react';
import { ImageBackground, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Modal from '../../../components/Modal';
import CustomText from '../../../components/Text';
import { ThemeContext } from '../../../ThemeContext';
import { parseCardAvatar, parseCardAvatarColor } from '../../../utils/lang';

export default ({ visible, onClose, cardAvatarID }: {
  visible: boolean;
  onClose: () => void;
  cardAvatarID?: number;
}) => {
  const theme = useContext(ThemeContext);

  const [card, setCard] = useState(cardAvatarID);

  const handleClose = () => {
    onClose();
  }
  return (
    <Modal 
      showCloseButton={false}
      animationType="none"
      visible={visible}
      onClose={handleClose}
      contentStyle={{
        height: 500,
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start'
      }}>
      <CustomText style={{ fontSize: 15, color: 'rgba(252, 252, 252, 0.54)', marginBottom: 16 }}>Select card</CustomText>
      <View style={{ flex: 1 }}>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          {[0, 1, 2, 3].map((item, index) => {
            return (
              <ImageBackground 
                key={`card-${index}`}
                imageStyle={{
                  resizeMode: 'cover',
                  width: 187,
                  height: 115,
                  borderRadius: 12,
                }}
                style={{
                  marginRight: 24,
                  width: 187,
                  height: 115,
                  borderRadius: 8,
                  justifyContent: 'flex-end',
                  padding: 12,
                }} source={parseCardAvatar(item || 0)}>
                  <CustomText style={{fontSize: 14, color: theme.textColor}}>{parseCardAvatarColor(item || 0)}</CustomText>
              </ImageBackground>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};
