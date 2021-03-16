import {atom} from 'recoil';

export const krc20ListAtom = atom({
  key: 'krc20ListAtom', // unique ID (with respect to other atoms/selectors)
  // default: [] as KRC20[],
  default: [
    {
      address: '0xae67DeAb9ff650862fD9CAC1127bad2132e8408a',
      name: 'Token 1',
      symbol: 'TOK1',
      decimals: 18,
    },
  ] as KRC20[], // default value (aka initial value)
});
