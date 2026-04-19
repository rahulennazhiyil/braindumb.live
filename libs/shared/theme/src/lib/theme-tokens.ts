export type ThemeName = 'glass' | 'terminal' | 'print' | 'synthwave';

export const THEMES: readonly ThemeName[] = [
  'glass',
  'terminal',
  'print',
  'synthwave',
] as const;

export const DEFAULT_THEME: ThemeName = 'glass';

export const THEME_STORAGE_KEY = 'rahul-dev:theme';

export const THEME_LABELS: Record<ThemeName, string> = {
  glass: 'Glass',
  terminal: 'Terminal',
  print: 'Print',
  synthwave: 'Synthwave',
};

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}
