import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { useUniwind } from 'uniwind';

export const THEME = {
	light: {
		background: '#f4f7f5',
		foreground: '#1d2b28',
		card: '#ffffff',
		cardForeground: '#1d2b28',
		popover: '#ffffff',
		popoverForeground: '#1d2b28',
		primary: '#2f6f64',
		primaryForeground: '#ffffff',
		secondary: '#e6efeb',
		secondaryForeground: '#24463e',
		muted: '#e9efec',
		mutedForeground: '#596963',
		accent: '#dcece6',
		accentForeground: '#204d43',
		destructive: '#a63d36',
		destructiveForeground: '#ffffff',
		border: '#d6e0db',
		input: '#71867b',
		ring: '#2f6f64',
		success: '#2c7556',
		warning: '#805400',
		radius: '0.625rem',
		chart1: '#b66a3c',
		chart2: '#2c7556',
		chart3: '#356b8a',
		chart4: '#a47b12',
		chart5: '#8a5a44',
	},
	dark: {
		background: '#101816',
		foreground: '#e9f1ed',
		card: '#18231f',
		cardForeground: '#e9f1ed',
		popover: '#1c2924',
		popoverForeground: '#e9f1ed',
		primary: '#8bc9b6',
		primaryForeground: '#10251e',
		secondary: '#24362f',
		secondaryForeground: '#deebe5',
		muted: '#202e29',
		mutedForeground: '#a9bbb2',
		accent: '#29473d',
		accentForeground: '#d5eee4',
		destructive: '#f08d84',
		destructiveForeground: '#24110f',
		border: '#33463f',
		input: '#849b90',
		ring: '#8bc9b6',
		success: '#81c9a5',
		warning: '#e2b86f',
		radius: '0.625rem',
		chart1: '#e49a72',
		chart2: '#81c9a5',
		chart3: '#8fc3dd',
		chart4: '#e2b86f',
		chart5: '#d3a58f',
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
			primary: THEME.light.primary,
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
			primary: THEME.dark.primary,
			text: THEME.dark.foreground,
		},
	},
};
