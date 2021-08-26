import {atom, selectorFamily} from 'recoil';

export const pendingTxAtom = atom({
  key: 'pendingTxAtom', // unique ID (with respect to other atoms/selectors)
  // default: {
  //   '0x01B3232Bc2AdfBa8c39Ba4A4002924d62e39aE5d': '123'
  // } as Record<string, any>,
  default: {} as Record<string, any>
});

export const pendingTxBackgroundAtom = atom({
  key: 'pendingTxBackgroundAtom',
  default: false
})

export const pendingTxSelector = selectorFamily({
  key: 'pendingTxSelector',
  get: (walletAddress: string) => ({get}) => {
    const pendingTxObj = get(pendingTxAtom)
    return pendingTxObj[walletAddress]
  },
  set: (key) => ({set}, value) => {
    set(pendingTxAtom, (prevState) => {
      return {...prevState, [key]: value}
    })
  },
})
