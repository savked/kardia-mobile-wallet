const ERROR_MAPPING: Record<string, string> = {
  'insufficient funds for gas * price + value': 'NOT_ENOUGH_KAI_FOR_TX',
  'intrinsic gas too low': 'GAS_TOO_LOW',
  'rlp: value size exceeds available input length': 'ERROR_SIGNING_TX'
};

export const getErrorKey = (message: string) => {
  if (!ERROR_MAPPING[message]) {
    return message;
  }
  return ERROR_MAPPING[message];
};

export const isRecognizedError = (errorMessage: string) => {
  if (ERROR_MAPPING[errorMessage]) return true
  return false
}
