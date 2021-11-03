import { atom, selectorFamily } from 'recoil';

export const DEFAULT_CACHE: Record<string, any> = {
  slippageTolerance: '0.1',
  txDeadline: '2'
};

export const cacheAtom = atom({
  key: 'cacheAtom', // unique ID (with respect to other atoms/selectors)
  default: DEFAULT_CACHE,
});

export const cacheSelector = selectorFamily({
  key: 'cacheSelector',
  get: (key: string) => ({get}) => {
    const cache = get(cacheAtom)
    return cache[key]
  },
  set: (key) => ({set}, value) => {
    set(cacheAtom, (prevState) => {
      return {...prevState, [key]: value}
    })
  },
})
