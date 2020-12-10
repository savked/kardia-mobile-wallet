interface Transaction {
  from: string;
  to: string;
  hash: string;
  amount: number | string;
  date: Date;
  fee?: number | string;
  blockHash?: string;
  blockNumber?: number;
  status?: number;
  gasPrice?: number;
  gas?: number;
  gasUsed?: number;
  gasLimit?: number;
}
