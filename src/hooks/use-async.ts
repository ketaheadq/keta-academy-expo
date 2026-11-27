import { useEffect, useRef, useState } from 'react';
import { describeError } from '@/lib/error-messages';

type AsyncState<T> = {
	data: T | null;
	loading: boolean;
	error: string | null;
	reload: () => void;
};

/**
 * Small data-loading helper: runs `loader` on mount and whenever a caller-supplied dependency
 * changes, ignoring results that arrive after unmount.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [nonce, setNonce] = useState(0);
	const loaderRef = useRef(loader);
	loaderRef.current = loader;

	// Callers pass a fresh array literal each render, so serialise it to a stable dependency.
	const depsKey = JSON.stringify(deps);

	// biome-ignore lint/correctness/useExhaustiveDependencies: depsKey and nonce are intentional re-run triggers, not values read inside the effect.
	useEffect(() => {
		let active = true;
		setLoading(true);
		setError(null);
		loaderRef
			.current()
			.then((result) => {
				if (active) setData(result);
			})
			.catch((cause) => {
				console.error('useAsync loader failed:', cause);
				if (active) setError(describeError(cause));
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [depsKey, nonce]);

	return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}
