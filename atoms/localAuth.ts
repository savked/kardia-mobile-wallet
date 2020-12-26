import {atom} from 'recoil';

export const localAuthAtom = atom({
  key: 'localAuth', // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
});
