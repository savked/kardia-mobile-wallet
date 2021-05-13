import { BigNumber } from 'bignumber.js';
import numeral from 'numeral';
export const isNumber = (val: string) => {
  return /^\d+(,\d{3})*(\.\d*)?$/.test(val);
};

export const getDigit = (val: string) => {
  let result = '';
  for (let index = 0; index < val.length; index++) {
    const char = val.charAt(index);
    if (/\d/.test(char)) {
      result += char;
    } else if (char === '.') {
      result += char;
    }
  }
  if (result[0] === '0' && result[1] !== '.') {
    result = result.slice(1);
  }
  // if (result[result.length - 1] === '.') {
  //   result += '0';
  // }
  return result;
};

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
  kaiAmount: number,
  showFull: boolean = false,
) => {
  if (kaiAmount < 10 ** 13) {
    return '0';
  }
  return numeral(kaiAmount / 10 ** 18).format(showFull ? '0,0.00' : '0,0.00a');
};

export const parseDecimals = (kaiAmount: number | string, decimals: number) => {
  const rawValue = new BigNumber(kaiAmount);
  return rawValue.dividedBy(new BigNumber(10 ** decimals)).toFixed()
  // return kaiAmount / 10 ** decimals;
};

export const cellValueWithDecimals = (amount: number | string, decimals: number) => {
  const rawValue = new BigNumber(amount);
  return rawValue.multipliedBy(new BigNumber(10 ** decimals)).toFixed()
  // return kaiAmount / 10 ** decimals;
}

export const formatNumberString = (numberString: string, fragtionsCount?: number) => {
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
  return (new BigNumber(numberString)).toFormat(fragtionsCount)
}
