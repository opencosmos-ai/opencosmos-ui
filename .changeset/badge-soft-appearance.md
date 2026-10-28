---
"@opencosmos/ui": minor
---

`Badge` takes a new `appearance` prop. `appearance="soft"` keeps the variant's colour but drops the fill: coloured text, a same-colour outline and a faint same-colour tint. Use it for data chips (counts, ages, statuses) that should sit beside content rather than compete with it, for example `<Badge variant="warning" appearance="soft" size="sm">5 days</Badge>`. It works with every coloured variant (`default`, `secondary`, `destructive`, `success`, `warning`, `error`, `info`) and does nothing to `outline`. The default stays `solid`, so existing badges render exactly as before.
