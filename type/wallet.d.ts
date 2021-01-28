interface Wallet {
  address: string;
  privateKey?: string;
  balance: number;
  staked: number;
}

interface Address {
  name: string;
  address: string;
  avatar?: string;
}
