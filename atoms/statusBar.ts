import { atom } from 'recoil';
import themes from '../theme/index';

const DEFAULT_THEME = themes.dark;

export const statusBarColorAtom = atom({
  key: 'statusBarColorAtom', // unique ID (with respect to other atoms/selectors)
  default: DEFAULT_THEME.backgroundColor, // default value (aka initial value)
});
