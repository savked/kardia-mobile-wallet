import {atom} from 'recoil';

export const tokenInfoAtom = atom({
  key: 'tokenInfoAtom', // unique ID (with respect to other atoms/selectors)
  default: {} as KAITokenInfo, // default value (aka initial value)
});
