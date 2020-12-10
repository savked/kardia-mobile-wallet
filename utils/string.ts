export const truncate = (str: string, n: number, e: number) => {
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
  const result = addressBook.find((item) => item.address === address);
  if (!result) {
    return address;
  }
  return result.name;
};
