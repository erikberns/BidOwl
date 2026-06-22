/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#03161A',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#717171',
  },
  dark: {
    text: '#ffffff',
    background: '#03161A',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#717171',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Urbanist-Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
    body: 'NunitoSans-Regular',
    logo: 'Parkinsans-Bold',
  },
  default: {
    sans: 'Urbanist-Regular',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    body: 'NunitoSans-Regular',
    logo: 'Parkinsans-Bold',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
    body: 'var(--font-body)',
    logo: 'var(--font-logo)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const BrandColors = {
  primary: '#03161A', // Fondo Neutro | Color de Textos no Cuerpo
  accent: '#BAEB51',  // Acento
  success: '#2B9463', // Segundo Verde
  muted: '#717171',   // Textos gris
  border: '#F0F0F0',  // light border
  danger: '#BA4756',  // Rojo | Rechazo
} as const;
