import Web3 from 'web3'
export const parseTxMetaForKardiaConnect = (txMeta: string) => {
  // %7C is URL encoded of |
  const paramsArr = txMeta.split('%7C')
  if (paramsArr.length < 6) {
    throw new Error('Invalid tx meta')
  }

  return {
    from: paramsArr[0],
    to: paramsArr[1],
    value: paramsArr[2],
    gas: paramsArr[3],
    gasPrice: paramsArr[4],
    data: paramsArr[5]
  }
}

export const getApproveMessage = (callbackSchema: string) => {
  return `approve|${callbackSchema}`
}

export const getAddressFromSignature = (signature: string, schema: string) => {
  const web3 = new Web3()
  return web3.eth.accounts.recover(getApproveMessage(schema), signature)
}

export const verifySignature = (signature: string, schema: string, walletAddress: string) => {
  return getAddressFromSignature(signature, schema).toLowerCase() === walletAddress.toLowerCase()
}