---
"@opencosmos/mcp": patch
---

Describe `AppSidebar` and `OpenCosmosIcon` in the registry

Both were exported from `@opencosmos/ui` and installable, and neither appeared
in the MCP registry — so an agent asking this library what it offers was never
told they existed, and would reasonably write a bespoke sidebar instead.

`AppSidebar` gains its full prop surface and its four sub-exports
(`AppSidebarProvider`, `AppSidebarInset`, `useAppSidebar`, `useIsMobile`),
including the responsive behaviour that matters at the call site: it pushes
content on desktop and overlays it over a dismissable scrim below 768px.
