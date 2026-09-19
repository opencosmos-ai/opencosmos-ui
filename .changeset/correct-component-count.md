---
"@opencosmos/ui": patch
"@opencosmos/mcp": patch
---

Say 104 components, which is how many there are

Both READMEs, the ejection CLI's description and the MCP tool docs advertised
**100**. The library exports **104**, and has since `AppSidebar` and
`OpenCosmosIcon` were added to the registry — a count that is now enforced by a
test rather than maintained by hand, so this is the last time it can drift
unnoticed.
