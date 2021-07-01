const ERROR_MAPPING: Record<string, string> = {
  'insufficient funds for gas * price + value': 'NOT_ENOUGH_KAI_FOR_TX',
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
