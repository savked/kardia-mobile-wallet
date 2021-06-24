const KRC20_TRANSFER_SIGN = 'function transfer(address _receiver, uint256 _amount) returns(bool success)'
const KRC20_TRANSFER_METHOD_NAME = 'transfer'

export const isKRC20Tx = (txObj: Record<string, any>) => {
  if (!txObj.toName || !txObj.decodedInputData) return false;

  const functionSign = txObj.decodedInputData.function
  if (!functionSign || functionSign !== KRC20_TRANSFER_SIGN) return false

  const methodName = txObj.decodedInputData.methodName
  if (!methodName || methodName !== KRC20_TRANSFER_METHOD_NAME) return false

  const args = txObj.decodedInputData.arguments
  if (!args) return false

  if (!args._amount || !args._receiver) return false
  return true
}