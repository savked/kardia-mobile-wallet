import { formatDistance } from 'date-fns'
import React, { useContext } from 'react'
import { View, ScrollView } from 'react-native'
import { useRecoilValue } from 'recoil'
import { languageAtom } from '../../../atoms/language'
import Button from '../../../components/Button'
import List from '../../../components/List'
import CustomModal from '../../../components/Modal'
import CustomText from '../../../components/Text'
import { ThemeContext } from '../../../ThemeContext'
import { getDateFNSLocale, getLanguageString } from '../../../utils/lang'
import { formatNumberString, parseDecimals } from '../../../utils/number'
import { getSemiBoldStyle } from '../../../utils/style'

export default ({
  visible,
  onClose,
  unbondedRecords
}: {
  visible: boolean;
  onClose: () => void;
  unbondedRecords: StakingUnbondedRecord[]
}) => {
  const theme = useContext(ThemeContext)
  const language = useRecoilValue(languageAtom)

  return (
    <CustomModal
      visible={visible}
      showCloseButton={false}
      onClose={onClose}
      contentStyle={{
        backgroundColor: theme.backgroundFocusColor,
        justifyContent: 'flex-start',
        padding: 20,
        height: 300,
      }}
    >
      <View style={{width: '100%', marginBottom: 40}}>
        <CustomText style={[{color: theme.textColor, fontSize: 24}, getSemiBoldStyle()]}>
          {getLanguageString(language, 'UNBONDED_DETAIL')}
        </CustomText>
      </View>
      <View style={{width: '100%', flex: 1, paddingBottom: 14}}>
        <List 
          listStyle={{
            width: '100%',
            flex: 1
          }}
          items={unbondedRecords}
          keyExtractor={(_, index) => `unbonded-item-${index}`}
          render={(unbondedItem: StakingUnbondedRecord) => {
            return (
              <View 
                style={{
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  width: '100%',
                  marginBottom: 8
                }}
                onStartShouldSetResponder={() => true}
              >
                <CustomText
                  style={{color: theme.textColor}}
                >
                  {formatNumberString(parseDecimals(unbondedItem.balance, 18))} KAI
                </CustomText>
                <CustomText
                  style={{color: theme.textColor}}
                >
                  {
                    formatDistance(unbondedItem.completionTime, new Date(), {locale: getDateFNSLocale(language), includeSeconds: true})
                  }
                </CustomText>
              </View>
            )
          }}
        />
        <Button 
          title="OK"
          onPress={onClose}
          textStyle={getSemiBoldStyle()}
        />
      </View>
    </CustomModal>
  )
}