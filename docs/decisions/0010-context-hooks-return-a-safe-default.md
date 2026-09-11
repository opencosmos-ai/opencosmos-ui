# 0010 — A context hook in this library returns a safe default; it never throws

**Date:** 2026-04-03 · **Status:** Accepted · **Relates to** [0011](0011-no-eager-jsx-in-registry-examples.md)

_Under `transpilePackages`, webpack can split a component from the module that called `createContext`, so `useContext` returns null with the Provider present — and the standard throw turns a cosmetic problem into a crash._

## Context

`AppSidebar` used the conventional pattern:

```ts
const ctx = useContext(AppSidebarContext)
if (!ctx) throw new Error('useAppSidebar must be used within an AppSidebarProvider')
```

It threw in Studio with `AppSidebarProvider` unambiguously in the tree, one component above it.

The cause is `transpilePackages: ['@opencosmos/ui', ...]` in `apps/web/next.config.mjs`. That tells Next.js to bundle the package's **source** rather than its `dist/`, which lets webpack split `AppSidebar.tsx` and the module rendering it into separate chunks. Each chunk gets its own module instance, so `createContext()` runs twice and produces two distinct context objects. The Provider writes to instance A; the consumer reads from instance B. `useContext` returns `null` no matter what the tree looks like, and the error message actively misleads — it tells the developer to add a Provider that is already there.

This is not a Studio-only concern. Any consumer using `transpilePackages` on `@opencosmos/ui` — a reasonable thing to do — reproduces it. The library cannot assume it is executing as a single module instance.

There is a second, more common case with the same shape: a component rendered legitimately without its Provider — in a test, in a docs playground, in isolation. Throwing makes those contexts impossible rather than degraded.

## Decision

**A context hook in `@opencosmos/ui` must not throw when its context is null.** It returns a safe default:

```ts
const DEFAULT_CONTEXT: AppSidebarContextValue = {
    isOpen: true,
    toggle: () => {},
    open: () => {},
    close: () => {},
};

export function useAppSidebar(): AppSidebarContextValue {
    return useContext(AppSidebarContext) ?? DEFAULT_CONTEXT;
}
```

The default is chosen so the component renders correctly in its most useful state. What is lost is the stateful behaviour that needs the Provider — for `AppSidebar`, the open/closed state stops persisting to `localStorage`. Consumers should still wrap in the Provider; they are simply no longer punished with a crash when they have not, or when webpack has made it moot.

Where a subcomponent genuinely cannot render without context, `console.warn` and return `null` — the pattern `DragDropHandle` uses. Degrade, and say why.

## Consequences

- A missing Provider is now a quiet degradation rather than a loud crash, which is the trade being made deliberately. The `console.warn` path exists so it is not silent where it matters.
- **The rule is not yet applied everywhere.** `useCarousel` and `useToast` still throw. Both are single-tree usages that have not hit the chunk-splitting case, but nothing prevents them from doing so, and a consumer with `transpilePackages` could trip either. They should be converted; until they are, this record describes the rule and not the whole of the code.
- Any new component using `createContext` inherits this constraint. It is the first thing to check in review.
- The underlying duplicate-instance problem is not fixed, only made survivable. A context carrying data rather than behaviour would still read as empty.

## Alternatives considered

- **Remove `transpilePackages` from `apps/web`.** Rejected: it would fix Studio and leave every consumer that uses it exposed. The library has to survive the configuration, not forbid it.
- **Keep throwing, and document the trap.** Rejected: the error names a cause that is not the cause. It sends the reader to add a Provider they already have, which is the worst possible diagnostic.
- **Singleton the context on `globalThis`.** Rejected: it papers over module duplication in a way that would hide genuinely broken bundling and behave unpredictably across React roots.
- **`useSyncExternalStore` or a module-level store instead of context.** Not rejected on merits — it sidesteps the duplication entirely for state that is not tree-scoped, and is worth considering for any future component of this kind. It was not worth rewriting `AppSidebar` for.
