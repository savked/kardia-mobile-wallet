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
    maximumFractionDigits: 18,
  };

  if (options) {
    defaultOption = Object.assign(defaultOption, options);
  }

  return new Intl.NumberFormat('en-US', defaultOption).format(val);
};

export const parseKaiBalance = (kaiAmount: number) => {
  if (kaiAmount < 10 ** 13) {
    return '0';
  }
  return numeral(kaiAmount / 10 ** 18).format('0,0.00a');
};
