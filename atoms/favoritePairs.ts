import { atom } from 'recoil';

export const favoritePairsAtom = atom({
  key: 'favoritePairsAtom', // unique ID (with respect to other atoms/selectors)
  default: [] as string[]
});
