import { atom } from 'recoil';

export const notificationAtom = atom({
  key: 'notificationAtom', // unique ID (with respect to other atoms/selectors),
  default: [] as Notification[],
  // default: [
  //   {
  //     url: 'https://reactnative.dev/img/tiny_logo.png',
  //     title: 'The News that wins customers',
  //     description: 'Why I quit my job in order to pursue News',
  //     date: new Date(1606876708000),
  //   },
  //   {
  //     url: 'https://reactnative.dev/img/tiny_logo.png',
  //     title: 'News in 3 easy steps',
  //     description: "12 things you didn't know about News",
  //     date: new Date(1606876708000),
  //   },
  //   {
  //     url: 'https://reactnative.dev/img/tiny_logo.png',
  //     title: 'How News are changing my life',
  //     description: 'Is pizza really better than News?',
  //     date: new Date(1606876708000),
  //   },
  //   {
  //     url: 'https://reactnative.dev/img/tiny_logo.png',
  //     title: 'Why News are more important than the air you breathe',
  //     description: '5 important lessons I learned about News',
  //     date: new Date(1606876708000),
  //   },
  //   {
  //     url: 'https://reactnative.dev/img/tiny_logo.png',
  //     title: 'How to use News to solve problems',
  //     description: 'How much is News worth to you?',
  //     date: new Date(1606876708000),
  //   },
  //   {
  //     url: 'https://reactnative.dev/img/tiny_logo.png',
  //     title: '3 different ways to get your own News',
  //     description: 'How News are changing my life',
  //     date: new Date(1606876708000),
  //   },
  // ] as Notification[], // default value (aka initial value)
});
