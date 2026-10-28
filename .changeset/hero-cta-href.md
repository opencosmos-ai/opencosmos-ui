---
"@opencosmos/ui": patch
---

`HeroBlock` now honours `href` on `primaryCta` and `secondaryCta`. Before, `href` was accepted by the types but ignored, so a CTA given only an `href` rendered as a button that did nothing. A CTA with `href` now renders as a real link (it navigates, opens in a new tab on middle-click, and reads as a link to screen readers); a CTA with only `onClick` is unchanged.
