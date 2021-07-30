import React, { useContext } from 'react'
import CustomModal from '../../../components/Modal'
import { ThemeContext } from '../../../ThemeContext'
import MarketTradeForm from '../MarketTradeForm'

export default ({visible, onClose, pairItem, onSuccess}: {
  visible: boolean;
  onClose: () => void;
  pairItem: Pair;
  onSuccess: 
    ({
      mode, 
      amountTo,
      amountFrom,
      txResult,
    }: {
      mode: string 
      amountTo: string
      amountFrom: string
      txResult: string | Record<string, any>
    }) => void
}) => {
  const theme = useContext(ThemeContext)
  const getModalContentStyle = () => {
    return {
      backgroundColor: theme.backgroundFocusColor,
      height: 600,
      padding: 0
    }
  }

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={getModalContentStyle()}
    >
      <MarketTradeForm pairItem={pairItem} onSuccess={onSuccess} />
    </CustomModal>
  )
}