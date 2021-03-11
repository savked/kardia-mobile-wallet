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

interface KRC20Transaction {
  address: string;
  methodName: string;
  argumentsName: string;
  arguments: {
    from: string;
    to: string;
    value: string;
  };
  topics: string[];
  data: string;
  blockHeight: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
  time: string;
  logo: string;
  decimals: number;
  tokenName: string;
  tokenType: string;
  tokenSymbol: string;
  totalSupply: string;
}
