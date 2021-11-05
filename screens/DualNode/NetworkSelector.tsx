import React, { useContext, useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { languageAtom } from '../../atoms/language';
import CustomText from '../../components/Text';
import { KAI_NETWORK_LOGO } from '../../config';
import { getSupportedChains } from '../../services/dualnode';
import { ThemeContext } from '../../ThemeContext';
import { getLanguageString } from '../../utils/lang';
import { getSemiBoldStyle } from '../../utils/style';
import SelectNetworkModal from './SelectNetworkModal';

export default ({onSelectChain, selectedChain}: {
  onSelectChain: (chain: DualNodeChain) => void;
  selectedChain?: DualNodeChain
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  const [supportedChain, setSupportedChain] = useState<DualNodeChain[]>([])
  const [showSelectNetwork, setShowSelectNetwork] = useState(false)

  useEffect(() => {
    (async () => {
      const rs = await getSupportedChains()
      setSupportedChain(rs)
      onSelectChain(rs[0])
    })()
  }, [])
  return (
    <View
      style={{
        marginVertical: 14,
        padding: 16,
        backgroundColor: theme.backgroundStrongColor,
        borderRadius: 8
      }}
    >
      <SelectNetworkModal 
        visible={showSelectNetwork}
        onClose={() => setShowSelectNetwork(false)}
        networkList={supportedChain}
        onSelect={(newChain) => {
          setShowSelectNetwork(false)
          onSelectChain(newChain)
        }}
      />
      <View style={{marginBottom: 12}}>
        <CustomText 
          style={[{
            color: theme.textColor
          }, getSemiBoldStyle()]}
        >
          {getLanguageString(language, 'NETWORK')}
        </CustomText>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', justifyContent: 'flex-start', flex: 1}}>
          <Image 
            source={{uri: KAI_NETWORK_LOGO}}
            style={{
              width: 28,
              height: 28,
              marginRight: 8
            }}
          />
          <View>
            <CustomText 
              style={{
                color: theme.textColor,
                fontWeight: 'bold',
                fontSize: theme.defaultFontSize + 3
              }}
            >
              KardiaChain
            </CustomText>
            <CustomText
              style={[{
                color: theme.mutedTextColor,
                fontSize: theme.defaultFontSize
              }, getSemiBoldStyle()]}
            >
              KRC20
            </CustomText>
          </View>
        </View>
        <Image 
          source={require('../../assets/icon/dualnode_network.png')}
          style={{width: 15, height: 9, marginHorizontal: 15}}
        />
        <View style={{flexDirection: 'row', justifyContent: 'flex-start', flex: 1}}>
          {
            selectedChain && (
              <Image 
                source={{uri: selectedChain.icon}}
                style={{
                  width: 28,
                  height: 28,
                  marginRight: 8
                }}
              />
            )
          }
          <TouchableOpacity onPress={() => setShowSelectNetwork(true)}>
            <CustomText 
              style={{
                color: theme.textColor,
                fontWeight: 'bold',
                fontSize: theme.defaultFontSize + 3
              }}
            >
              {selectedChain ? selectedChain.name : ''}
            </CustomText>
            <CustomText
              style={[{
                color: theme.urlColor,
                fontSize: theme.defaultFontSize
              }, getSemiBoldStyle()]}
            >
              {getLanguageString(language, 'CHANGE_NETWORK')}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}