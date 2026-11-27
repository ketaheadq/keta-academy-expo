import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { secureStorage } from '@/lib/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
	preference: ThemePreference;
	hasHydrated: boolean;
	setPreference: (preference: ThemePreference) => void;
	setHydrated: (hydrated: boolean) => void;
}

function isThemePreference(value: unknown): value is ThemePreference {
	return value === 'system' || value === 'light' || value === 'dark';
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			preference: 'system',
			hasHydrated: false,
			setPreference: (preference) => set({ preference }),
			setHydrated: (hasHydrated) => set({ hasHydrated }),
		}),
		{
			name: 'theme-storage',
			storage: createJSONStorage(() => secureStorage),
			skipHydration: true,
			partialize: (state) => ({ preference: state.preference }),
			merge: (persisted, current) => {
				const stored = persisted as Partial<ThemeState> | undefined;
				return {
					...current,
					preference: isThemePreference(stored?.preference) ? stored.preference : 'system',
					hasHydrated: false,
				};
			},
		},
	),
);
