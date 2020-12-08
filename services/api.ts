export const getTXHistory = async (wallet: Wallet) => {
  return [
    {
      from: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      to: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a71',
      amount: 100,
      date: new Date(),
    },
    {
      from: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      to: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a72',
      amount: 100,
      date: new Date(),
    },
    {
      from: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      to: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a73',
      amount: 100,
      date: new Date(),
    },
    {
      from: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      to: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a74',
      amount: 200,
      date: new Date(),
    },
    {
      from: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      to: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a75',
      amount: 200,
      date: new Date(),
    },
    {
      from: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      to: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a76',
      amount: 200,
      date: new Date(),
    },
    {
      from: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      to: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a77',
      amount: 200,
      date: new Date(),
    },
    {
      from: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      to: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a78',
      amount: 200,
      date: new Date(),
    },
    {
      from: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
      to: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
      hash:
        '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a79',
      amount: 200,
      date: new Date(),
    },
  ];
};

export const getTxDetail = (txHash: string) => {
  return {
    from: '0xf8fcb8eEc610699Bd7d0A30433B75C5f60097eFC',
    to: '0xDA7acDE9A7e9F5EAd5ce2F9087de4ca37A65b1c6',
    hash: '0x94a7c2f45e578d6439ee529ff8d097ab4c15dd9947b5f5cfbf64565bae483a71',
    amount: 100,
    date: new Date(),
  };
};
