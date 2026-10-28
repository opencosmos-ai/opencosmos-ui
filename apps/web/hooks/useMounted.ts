'use client';

import { useSyncExternalStore } from 'react';

/**
 * `false` while rendering on the server and during the first hydration render,
 * `true` from then on.
 *
 * This is the hydration guard the Studio uses to defer client-only UI —
 * anything that reads `localStorage`, `window`, or the live theme store and
 * would otherwise render differently on the server than on the client.
 *
 * It replaces the `useState(false)` + `useEffect(() => setMounted(true), [])`
 * pattern. That pattern is correct but sets state synchronously inside an
 * effect, which schedules a second render pass and is flagged by the React
 * Compiler's `set-state-in-effect` rule. `useSyncExternalStore` expresses the
 * same "server says false, client says true" split directly, with React
 * handling the transition.
 *
 * The store never changes after hydration, so `subscribe` returns a no-op
 * unsubscribe and is never called back. All three callbacks are module-level
 * constants so their identity is stable across renders.
 */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
