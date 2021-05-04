interface Wallet {
  name?: string;
  mnemonic?: string;
  address: string;
  privateKey?: string;
  balance: number;
  staked: number;
  undelegating: number;
  cardAvatarID?: number;
}

interface Address {
  name: string;
  address: string;
  avatar?: string;
}
