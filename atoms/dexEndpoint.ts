import {atom} from 'recoil';

export const fontSizeAtom = atom({
  key: 'dexEndpoint', // unique ID (with respect to other atoms/selectors)
  default: 'https://dex-backend-dev.kardiachain.io/api/v1/', // default value (aka initial value)
});

export const swapRouterAtom = atom({
  key: 'swapRouterAtom',
  default: '0x2333b9f09fAd1c30d108742C2097498d84413588'
})

export const factoryAtom = atom({
  key: 'factoryAtom',
  default: '0x488056D93c1Ac82354ec70B4e43140F689Cb2292'
})

export const limitOrderAtom = atom({
  key: 'limitOrderAtom',
  default: '0x3E88CE7E64Bb2763CB8e40CF0d6eb9669f391A6b'
})

export const wKAIAtom = atom({
  key: 'wKAIAtom',
  default: '0x02655eEF130e5F37F8b648BD9c8D10aA2e6bf698'
})
