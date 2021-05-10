import { gql } from '@apollo/client';

export const GET_PAIRS = gql`
  query GetPairs {
    pairs {
      decimals
      last_updated
      pair_name
      token1
      token1_liquidity
      token2
      token2_liquidity
      total_liquidity
      t1 {
        hash
        name
        logo
        symbol
        decimals
      }
      t2 {
        hash
        name
        logo
        symbol
        decimals
      }
    }
  }
`;
