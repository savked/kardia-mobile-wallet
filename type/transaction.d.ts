interface Transaction {
  from: string;
  to: string;
  hash: string;
  amount: number;
  date: Date;
  fee?: number;
  blockHash?: string;
  blockNumber?: number;
  status?: number;
}
