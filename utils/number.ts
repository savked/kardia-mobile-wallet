import { BigNumber } from 'bignumber.js';
import numeral from 'numeral';
export const isNumber = (val: string) => {
  return /^\d+(,\d{3})*(\.\d*)?$/.test(val);
};

export const isNaN = (val: any) => {
  if (typeof val === 'number') return Number.isNaN(val)
  if (typeof val === 'string') return val.toLowerCase() === 'nan'
  return true
}

export const getDigit = (val: string, editting = true) => {
  let result = '';
  let decimalPointExists = false
  for (let index = 0; index < val.length; index++) {
    const char = val.charAt(index);
    if (/\d/.test(char)) {
      result += char;
    } else if (char === '.' && !decimalPointExists) {
      result += char;
      decimalPointExists = true
    } else if (char === 'e' || char === '+' || char === '-') {
      result += char;
    }
  }
  if (result[0] === '0' && result[1] !== '.' && !editting) {
    result = result.slice(1);
  }
  if (result[result.length - 1] === '.' && !editting) {
    result = result.slice(0, result.length - 1)
  }
  return result;
};

export const getDecimalCount = (val: string) => {
  const digitOnly = getDigit(val);
  const parts = digitOnly.split('.');
  if (parts.length < 2) return 0
  return parts[1].length
}

export const format = (val: number, options?: Intl.NumberFormatOptions) => {
  let defaultOption = {
    maximumFractionDigits: 20,
  };

  if (options) {
    defaultOption = Object.assign(defaultOption, options);
  }

  return new Intl.NumberFormat('en-US', defaultOption).format(val);
};

export const parseKaiBalance = (
  kaiAmount: string,
  showFull: boolean = false,
) => {
  const bnAmount = new BigNumber(kaiAmount)
  if (bnAmount.lt(new BigNumber(10**13))) {
    return '0';
  }

  const kaiValue = bnAmount.dividedBy(new BigNumber(10**18))

  return numeral(kaiValue).format(showFull ? '0,0.00' : '0,0.00a');
};

export const parseDecimals = (kaiAmount: number | string, decimals: number) => {
  const rawValue = new BigNumber(kaiAmount);
  return rawValue.dividedBy(new BigNumber(10 ** decimals)).toFixed()
  // return kaiAmount / 10 ** decimals;
};

export const cellValueWithDecimals = (amount: number | string, decimals: number, returnType = 'string') => {
  const rawValue = new BigNumber(amount);
  if (returnType === 'bignum') {
    return rawValue.multipliedBy(new BigNumber(10 ** decimals))
  }
  return rawValue.multipliedBy(new BigNumber(10 ** decimals)).toFixed(0, 1)
  // return kaiAmount / 10 ** decimals;
}

export const getPartial = (value: string, partial: number, decimals: number) => {
  return (new BigNumber(value)).multipliedBy(new BigNumber(partial)).toFixed(decimals, 1)
  // return (cellValueWithDecimals(value, decimals, 'bignum') as BigNumber).multipliedBy(new BigNumber(partial)).toFixed(decimals, 1)
}

export const formatNumberString = (numberString: string, fragtionsCount?: number, roundMode: BigNumber.RoundingMode = 1) => {
  if (!numberString) return '0'
  if (typeof numberString !== 'string') {
    numberString = (new BigNumber(numberString)).toFixed()
  }

  const fmt = {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
    suffix: ''
  }
  BigNumber.config({ FORMAT: fmt })
  if (fragtionsCount) return (new BigNumber(numberString)).toFormat(fragtionsCount, roundMode)
  return (new BigNumber(numberString)).toFormat()
}
