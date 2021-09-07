import React, { useContext } from 'react';
import { Image, Platform, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import SelectModal from '../../components/SelectModal';
import CustomText from '../../components/Text';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';

export default ({asset, selectAsset, supportedAssets = [], errorAsset}: {
  asset?: DualNodeToken;
  selectAsset: (newAsset: DualNodeToken) => void,
  supportedAssets?: DualNodeToken[];
  errorAsset: string
}) => {

  const language = useRecoilValue(languageAtom)
  const theme = useContext(ThemeContext)

  const renderIcon = (avatar: string) => {
    return (
      <View style={{marginRight: 12}}>
        <View
          style={{
            width: 30,
            height: 30,

            borderRadius: 15,
            backgroundColor: 'white',

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',

            borderWidth: 1,
            borderColor: 'gray',
          }}>
          {avatar ? (
            <Image 
              source={{uri: avatar}} 
              style={{
                width: 30,
                height: 30,
                borderRadius: 25,
              }} 
            />
          ) : (
            <Image
              source={require('../../assets/logo.png')}
              style={{
                width: 30,
                height: 30,
                borderRadius: 25,
              }}
            />
          )}
        </View>
      </View>
    );
  };

  const renderTokenItem = ({tokenAvatar, tokenSymbol}: {
    tokenAvatar: string,
    tokenSymbol: string,
  }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flex: 1,
        }}
      >
        {renderIcon(tokenAvatar)}
        <CustomText
          allowFontScaling={false}
          style={{
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
          }}>
          {tokenSymbol}
        </CustomText>
      </View>
    )
  }

  return (
    <SelectModal
      headline={getLanguageString(language, 'ASSET')}
      containerStyle={{
        marginBottom: errorAsset ? 12 : 22
      }}
      message={errorAsset}
      value={asset}
      onSelect={selectAsset}
      item={supportedAssets}
      renderSelected={(item: KRC20) => {
        return (
          <View style={{flexDirection: 'row'}}>
            <Image 
              source={{uri: item.avatar}}
              style={{
                width: 18,
                height: 18,
                marginRight: 4
              }}
            />
            <CustomText 
              style={{
                color: theme.textColor,
                fontWeight: '500',
                fontFamily: Platform.OS === 'android' ? 'WorkSans-SemiBold' : undefined,
                fontSize: theme.defaultFontSize + 3
              }}
            >
              {item.name}
            </CustomText>
          </View>
        )
      }}
      renderItem={(item: KRC20, index) => renderTokenItem({
        tokenAvatar: item.avatar || '',
        tokenSymbol: item.symbol
      })}
    />
  )
}