interface Wallet {
  address: string;
  privateKey?: string;
  balance: number;
}

interface Address {
  name: string;
  address: string;
  avatar?: string;
}
