import Web3 from 'web3'
export const getVerifiedAppSchema = () => {
  return [
    {
      schema: 'thetan',
      name: 'Thetan Arena',
      logo: 'https://thetanarena.com/images/GameIcon.png'
    }
  ]
}

export const getApproveMessage = (callbackSchema: string) => {
  return `approve|${callbackSchema}`
}

export const verifySignature = (signature: string, schema: string, wallet:Wallet) => {
  const web3 = new Web3()
  const address = web3.eth.accounts.recover(getApproveMessage(schema), signature)
  return address === wallet.address
}