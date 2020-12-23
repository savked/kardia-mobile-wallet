import React from 'react';
import themes from './theme/index';

const DEFAULT_THEME = themes.dark;
export const ThemeContext = React.createContext(DEFAULT_THEME);
