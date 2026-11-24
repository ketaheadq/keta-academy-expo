import type { StateStorage } from 'zustand/middleware';

export const secureStorage: StateStorage = {
	getItem: (name) => (typeof window === 'undefined' ? null : window.localStorage.getItem(name)),
	setItem: (name, value) => {
		if (typeof window !== 'undefined') window.localStorage.setItem(name, value);
	},
	removeItem: (name) => {
		if (typeof window !== 'undefined') window.localStorage.removeItem(name);
	},
};
