import { atom } from 'recoil';

export const referralCodeAtom = atom({
  key: 'referralCodeAtom', // unique ID (with respect to other atoms/selectors)
  default: '' as string, // default value (aka initial value)
});
