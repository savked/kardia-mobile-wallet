import {atom} from 'recoil';

export const dexStatusAtom = atom({
  key: 'dexStatusAtom', // unique ID (with respect to other atoms/selectors)
  default: 'OFFLINE', // default value (aka initial value)
});