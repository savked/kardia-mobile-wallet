import { atom } from 'recoil';

export const showTabBarAtom = atom({
  key: 'showTabBarAtom', // unique ID (with respect to other atoms/selectors)
  default: true, // default value (aka initial value)
});
