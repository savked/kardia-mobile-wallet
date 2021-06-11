import { gql } from '@apollo/client';

// export const GET_PAIRS = gql`
//   query GetPairs {
//     pairs {
//       decimals
//       contract_address
//       last_updated
//       pair_name
//       token1
//       token1_liquidity
//       token2
//       token2_liquidity
//       total_liquidity
//       t1 {
//         hash
//         name
//         logo
//         symbol
//         decimals
//       }
//       t2 {
//         hash
//         name
//         logo
//         symbol
//         decimals
//       }
//     }
//   }
// `;

export const GET_PAIRS = gql`
  query pairList {
    pairs(orderBy:volumeUSD, orderDirection: desc) {
      id
      reserve0
      reserve1
      reserveUSD
      volumeUSD
      pairIdentity {
        invert
      }
      token0Price
      token1Price
      token0 {
        symbol
        name
        decimals
        id
      }
      token1 {
        symbol
        name
        decimals
        id
      }
    }
  }
`;
