import { gql } from '@apollo/client';

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

export const GET_BLOCKS_BY_TIMESTAMPS = (timestamps: number[]) => {
  let queryString = 'query blocks {'
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
        number
      }`
  })
  queryString += '}'
  return gql(queryString)
}

export const PAIR_LIST_BY_BLOCK_NUMBER = (blocks: any[]) => {
  let queryString = `query blocks {`
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}: pairs (block: { number: ${block.number} }) { 
              id
              reserve0
              reserve1
              reserveUSD
              volumeUSD
              pairIdentity {
                  invert
              }
          }
      `
  )
  queryString += '}'
  return gql(queryString)
}
