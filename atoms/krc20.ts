import { atom, selectorFamily } from 'recoil';

export const krc20PricesAtom = atom({
  key: 'krc20PricesAtom', // unique ID (with respect to other atoms/selectors)
  default: {} as Record<string, any>, // default value (aka initial value)
});

export const krc20ListAtom = atom({
  key: 'krc20ListAtom', // unique ID (with respect to other atoms/selectors)
  // default: [] as KRC20[],
  default: [] as KRC20[], // default value (aka initial value)
});

export const filterByOwnerSelector = selectorFamily({
  key: 'filterByOwnerSelector',
  get: (ownerAddress: string) => ({get}) => {
    const list = get(krc20ListAtom)
    return list.filter((item) => item.walletOwnerAddress === ownerAddress)
  }
})
