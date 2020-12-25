const ERROR_MAPPING: Record<string, string> = {
  'insufficient funds for gas * price + value': 'NOT_ENOUGH_BALANCE',
};

export const getErrorKey = (message: string) => {
  if (!ERROR_MAPPING[message]) {
    return message;
  }
  return ERROR_MAPPING[message];
};
