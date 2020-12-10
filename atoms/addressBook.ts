import {atom} from 'recoil';

export const addressBookAtom = atom({
  key: 'addressBookAtom', // unique ID (with respect to other atoms/selectors)
  default: [
    {
      address: '0xf64C35a3d5340B8493cE4CD988B3c1e890B2bD68',
      name: 'Genesis Wallet',
    },
  ] as Address[], // default value (aka initial value)
});
