import { atom } from 'recoil';

export const walletsAtom = atom({
  key: 'walletsAtom', // unique ID (with respect to other atoms/selectors)
  default: [] as Wallet[], // default value (aka initial value)
});

export const selectedWalletAtom = atom({
  key: 'selectedWalletAtom',
  default: 0,
});
