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

## 安全实践经验

### 代理 API Key 安全

如果使用第三方代理（如 `api.ikuncode.cc`）访问 Google API，代理的 API Key 也属于敏感信息，必须放在 `.env` 中，不能硬编码在脚本或模板里。代理 Key 泄露可能导致额度被盗用或服务被滥用。

### 微信 AppSecret 保护

AppSecret 泄露可导致公众号被完全控制（包括群发消息、修改配置等）。建议：
- `.env` 文件权限设为 `600`（仅所有者可读写）：`chmod 600 .env`
- 不要将 `.env` 提交到版本控制，确保 `.gitignore` 包含 `.env`
- 定期轮换 AppSecret

### 发布脚本安全

`templates/publish.mjs` 中的代理清除逻辑（`delete process.env.http_proxy` 等）是安全必要操作。微信 API 调用获取的 access_token 不应通过第三方代理传输，否则存在 token 被中间人截获的风险。发布脚本在调用微信接口前必须确保代理已清除。

### IP 白名单

微信公众号后台的 IP 白名单是重要的安全防线：
- 只添加必要的出口 IP，不要使用过宽的 CIDR 段
- 定期检查白名单中是否有多余或过期的 IP
- 公网 IP 可能因运营商调整而变化，变化后需及时更新白名单
- 新环境部署时，先确认出口 IP 再添加到白名单
