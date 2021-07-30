interface KRC20 {
  id: string;
  name: string;
  address: string;
  symbol: string;
  avatar?: string;
  decimals: number;
  price?: number;
  walletOwnerAddress?: string;
}

interface PairToken {
  hash: string;
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
}

interface Pair {
  decimals: number;
  pair_name: string;
  token1: string;
  token1_liquidity: string;
  token2: string;
  token2_liquidity: string;
  total_liquidity: string;
  t1: PairToken;
  t2: PairToken;
  contract_address: string;
  volumeUSD: string;
  invert: boolean;
}
