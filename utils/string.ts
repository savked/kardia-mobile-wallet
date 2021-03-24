import Clipboard from '@react-native-community/clipboard';
import {keccak256} from 'js-sha3';
import {EXPLORER_URL} from '../config';

export const truncate = (str: string, n: number, e: number) => {
  if (!str) {
    return '';
  }
  if (n > str.length - e) {
    return str;
  }
  return str.substr(0, n - 1) + '...' + str.substr(str.length - e - 1);
};

export const addZero = (value: number) => {
  if (value < 10) {
    return `0${value}`;
  }
  return `${value}`;
};

export const getFromAddressBook = (addressBook: Address[], address: string) => {
  const result = getObjFromAddressBook(addressBook, address);
  if (!result) {
    return address;
  }
  return result.name;
};

export const getObjFromAddressBook = (
  addressBook: Address[],
  address: string,
) => {
  const result = addressBook.find((item) => item.address === address);
  if (!result) {
    return null;
  }
  return result;
};

export const getAddressAvatar = (addressBook: Address[], address: string) => {
  const addressObj = getObjFromAddressBook(addressBook, address);
  if (!addressObj) {
    return '';
  }
  return addressObj.avatar;
};

export const copyToClipboard = (str: string) => {
  Clipboard.setString(str);
};

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export const isAddress = (address: string) => {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false;
  } else if (
    /^(0x)?[0-9a-f]{40}$/.test(address) ||
    /^(0x)?[0-9A-F]{40}$/.test(address)
  ) {
    // If it's all small caps or all all caps, return true
    return true;
  } else {
    // Otherwise check each case
    return isChecksumAddress(address);
  }
};

/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export const isChecksumAddress = (address: string) => {
  // Check each case
  address = address.replace('0x', '');
  var addressHash = keccak256(address.toLowerCase());
  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 &&
        address[i].toUpperCase() !== address[i]) ||
      (parseInt(addressHash[i], 16) <= 7 &&
        address[i].toLowerCase() !== address[i])
    ) {
      return false;
    }
  }
  return true;
};

export const getTxURL = (txHash: string) => {
  return `${EXPLORER_URL}/tx/${txHash}`;
};

export const groupByAlphabet = (
  data: Record<string, any>[],
  keyField: string,
) => {
  const groups = data.reduce((_groups, item) => {
    const groupString = item[keyField][0];
    if (!_groups[groupString]) {
      _groups[groupString] = [];
    }
    _groups[groupString].push(item);
    return _groups;
  }, {});

  return Object.keys(groups).map((char) => {
    return {
      char: groups[char][0][keyField][0].toUpperCase(),
      items: groups[char],
    };
  });
};
