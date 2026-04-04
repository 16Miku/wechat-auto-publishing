# Security Boundary

Use this reference when checking whether the skill package is safe to distribute.

## Allowed inside the skill

The skill may include:
- workflow instructions
- placeholder configuration examples
- directory structure examples
- templates
- wrapper script templates with placeholder paths
- result artifact schemas
- references explaining lookup order and validation steps

## Forbidden inside the skill

The skill must not include:
- real secrets
- real account identifiers unless explicitly required by the user
- cookies, sessions, tokens, access keys, or private URLs
- personal workspace details that are not necessary for reuse
- embedded secret values in templates or shell scripts

## Safe example policy

Examples should use placeholders like:
- `fill_in_valid_value_in_target_environment`
- `<project-dir>`
- `<gallery-root>`
- `<path-to-publisher-skill>`

## Distribution check

Before packaging, inspect the files and confirm:
- no real secret-looking values are present
- no personal `.env` contents are embedded
- no private公众号 identifiers are exposed unintentionally
- no hard-coded credentials appear in scripts or templates
