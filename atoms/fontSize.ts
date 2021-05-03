import {atom} from 'recoil';

export const fontSizeAtom = atom({
  key: 'fontSizeAtom', // unique ID (with respect to other atoms/selectors)
  default: 'small', // default value (aka initial value)
});
