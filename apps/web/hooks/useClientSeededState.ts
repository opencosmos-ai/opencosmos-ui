'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { useMounted } from './useMounted';

/**
 * State that renders as `initial` on the server and through hydration, then
 * seeds itself once from a client-only source — `localStorage`, `location`,
 * anything that does not exist during SSR — and is owned locally from then on.
 *
 * This replaces the `useEffect(() => { setX(readFromStorage()) }, [])` pattern.
 * The effect version sets state synchronously inside an effect, which the React
 * Compiler's `set-state-in-effect` rule flags. Seeding during render behind a
 * one-shot guard is the sanctioned alternative:
 * https://react.dev/learn/you-might-not-need-an-effect
 *
 * The observable behaviour is identical to the effect it replaces: `initial` is
 * what the server and the hydration render see, `seed()` runs exactly once
 * afterwards, and later updates go through the returned setter.
 *
 * Do NOT use this for state that must track an external store over time — that
 * is what `useSyncExternalStore` is for. This is strictly a one-time read.
 *
 * @param initial Value rendered on the server and during hydration.
 * @param seed    Runs once on the client. Must be safe to call in render:
 *                no side effects beyond reading. Return `initial` to leave the
 *                value alone.
 */
export function useClientSeededState<T>(
  initial: T,
  seed: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const mounted = useMounted();
  const [value, setValue] = useState<T>(initial);
  const [seeded, setSeeded] = useState(false);

  if (mounted && !seeded) {
    setSeeded(true);
    setValue(seed());
  }

  return [value, setValue];
}
