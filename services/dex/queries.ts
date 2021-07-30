import { gql } from '@apollo/client';

// export const GET_PAIRS = gql`
//   query pairList {
//     pairs(orderBy:volumeUSD, orderDirection: desc) {
//       id
//       reserve0
//       reserve1
//       reserveUSD
//       volumeUSD
//       pairIdentity {
//         invert
//       }
//       token0Price
//       token1Price
//       token0 {
//         symbol
//         name
//         decimals
//         id
//       }
//       token1 {
//         symbol
//         name
//         decimals
//         id
//       }
//     }
//   }
// `;

export const GET_PAIRS = gql`
  query pairList {
    pairs(orderBy:volumeUSD, orderDirection: desc) {
      id
      volumeUSD
    }
  }
`;

export const GET_PAIR_VOLUME = (pairAddress: string) => {
  return gql`
    query pairList {
      pairs(
        where: {
          id: "${pairAddress.toLowerCase()}"
        }
      ) {
        id
        volumeUSD
      }
    }
  `
}

export const GET_MARKET_HISTORY = (pairAddress: string) => {
  return gql`
    query marketHistory {
      swaps (where: {
        pair: "${pairAddress.toLowerCase()}"
      }, first: 20, orderBy: timestamp, orderDirection: desc) {
        pair {
          pairIdentity {
            invert
          }
        }
        timestamp
        id
        amount0In
        amount0Out
        amount1In
        amount1Out
        to
      }
    }
  `
}

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

export const MY_ORDER_HISTORY = gql`
  query MyOrderHistory ($actorAddress: String!, $skip: Int!, $first: Int!) {
    swaps(
      orderBy:timestamp,
      orderDirection:desc,
      where: {
        from: $actorAddress
      },
      skip: $skip,
      first: $first
    ) {
      pair {
        id
        pairIdentity {
          invert
        }
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
        token0Price
        token1Price
        reserveUSD
        reserve0
        reserve1
      }
      timestamp
      id
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
      sender
      transaction{
          id
      }
    }
  } 
`

export const GET_CHART_SUB = (resolution: string) => {
  let tableName: string = '';
  switch (resolution) {
      case '5':
          tableName = 'pair5MDatas'
          break;
      case '15':
          tableName = 'pair15MDatas'
          break;
      case '60':
          tableName = 'pairHourDatas'
          break;
      case '240':
          tableName = 'pair4HourDatas'
          break;
      case '1D':
          tableName = 'pairDayDatas'
          break;
      case '1W':
          tableName = 'pairWeekDatas'
          break;
      default:
          tableName = 'pair15MDatas'
          break;
  }

  return gql`
    query candlechart($pairAddress: String!, $timeFrom: Int!, $timeTo: Int!, $limit: Int!) {
      ${tableName}(where: {
        pairAddress: $pairAddress,
        startTimestamp_gt: $timeFrom,
        startTimestamp_lt: $timeTo
      }, orderBy: startTimestamp, orderDirection: desc, first: $limit) {
        id
        open0
        open1
        close0
        close1
        low0
        low1
        high0
        high1
        pairAddress
        volume
        startTimestamp
      }
    }
  `
}
