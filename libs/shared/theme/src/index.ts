export * from './lib/theme/theme';
export type ThemeName = 'glass' | 'terminal' | 'print' | 'synthwave';
export const THEMES: readonly ThemeName[] = [
  'glass',
  'terminal',
  'print',
  'synthwave',
] as const;
