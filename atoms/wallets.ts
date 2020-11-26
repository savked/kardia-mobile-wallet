import { atom } from "recoil";

interface Wallet {
    address: string;
    balance: number;
}

export const walletsAtom = atom({
    key: 'walletsAtom', // unique ID (with respect to other atoms/selectors)
    default: [] as Wallet[], // default value (aka initial value)
});

export const selectedWalletAtom = atom({
    key: 'selectedWalletAtom',
    default: 0
})