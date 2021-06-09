import {atom, selectorFamily} from 'recoil';

export const walletsAtom = atom({
  key: 'walletsAtom', // unique ID (with respect to other atoms/selectors)
  default: [] as Wallet[], // default value (aka initial value)
});

export const selectedWalletAtom = atom({
  key: 'selectedWalletAtom',
  default: 0,
});

export const getSelectedWallet = selectorFamily({
  key: 'selectedWalletSelector',
  get: () => ({get}) => {
    const wallets = get(walletsAtom)
    const selectedWallet = get(selectedWalletAtom)

    if (selectedWallet > wallets.length - 1) {
      return wallets[wallets.length - 1]
    }

    return wallets[selectedWallet]
  },
});
