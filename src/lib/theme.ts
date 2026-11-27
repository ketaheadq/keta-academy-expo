import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { useUniwind } from 'uniwind';

// Mirrors the tokens in src/global.css. Imperative consumers (SVG `color`, React
// Navigation themes, native props that take no class names) need literal values,
// so the two have to be edited together.
export const THEME = {
	light: {
		background: '#f4f6fa',
		foreground: '#0f172a',
		card: '#ffffff',
		cardForeground: '#1e293b',
		popover: '#ffffff',
		popoverForeground: '#0f172a',
		primary: '#0f172a',
		primaryForeground: '#f8fafc',
		secondary: '#e7ecf4',
		secondaryForeground: '#334155',
		muted: '#eceff5',
		mutedForeground: '#64748b',
		accent: '#b45309',
		accentForeground: '#ffffff',
		hero: '#0f172a',
		heroForeground: '#f8fafc',
		destructive: '#991b1b',
		destructiveForeground: '#ffffff',
		border: '#dce3ee',
		input: '#cbd5e1',
		ring: '#0f172a',
		success: '#15803d',
		warning: '#a16207',
		info: '#1d4ed8',
		radius: '0.625rem',
		chart1: '#0f172a',
		chart2: '#b45309',
		chart3: '#475569',
		chart4: '#f97316',
		chart5: '#94a3b8',
	},
	dark: {
		background: '#0b1120',
		foreground: '#f1f5f9',
		card: '#131c2e',
		cardForeground: '#e2e8f0',
		popover: '#162033',
		popoverForeground: '#f1f5f9',
		primary: '#93c5fd',
		primaryForeground: '#0b1120',
		secondary: '#1e293b',
		secondaryForeground: '#cbd5e1',
		muted: '#1a2436',
		mutedForeground: '#94a3b8',
		accent: '#f59e0b',
		accentForeground: '#0f172a',
		hero: '#16233b',
		heroForeground: '#f8fafc',
		destructive: '#f87171',
		destructiveForeground: '#0b1120',
		border: '#293548',
		input: '#334155',
		ring: '#93c5fd',
		success: '#4ade80',
		warning: '#facc15',
		info: '#93c5fd',
		radius: '0.625rem',
		chart1: '#93c5fd',
		chart2: '#f59e0b',
		chart3: '#cbd5e1',
		chart4: '#fb923c',
		chart5: '#64748b',
	},
} as const;

export type AppTheme = (typeof THEME)['light' | 'dark'];

export function useThemeColors(): AppTheme {
	const { theme } = useUniwind();
	return THEME[theme];
}

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
	light: {
		...DefaultTheme,
		colors: {
			background: THEME.light.background,
			border: THEME.light.border,
			card: THEME.light.card,
			notification: THEME.light.destructive,
			primary: THEME.light.accent,
			text: THEME.light.foreground,
		},
	},
	dark: {
		...DarkTheme,
		colors: {
			background: THEME.dark.background,
			border: THEME.dark.border,
			card: THEME.dark.card,
			notification: THEME.dark.destructive,
			primary: THEME.dark.accent,
			text: THEME.dark.foreground,
		},
	},
};
