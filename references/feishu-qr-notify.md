# 飞书推送微信验证二维码（人机协作扫码）

正式发表走 **通道 B（Chrome）** 时，微信后台常弹出 **「微信验证」** 二维码，必须由**管理员/运营者微信**扫码。Agent 不能代替扫码，但可以把二维码**截图并推到飞书**，方便操作员在手机上完成授权。

本页记录已验证可复用的实现约定与实测结论。

## 目标流程

```text
浏览器点「继续发表」
  → 检测到「微信验证」弹窗
  → 截取二维码图片（优先只截 QR 节点）
  → 保存到 output/YYYY-MM-DD/wechat-verify-qr.png
  → 清除代理环境变量
  → lark-cli 以 bot 发说明文字 + 图片到操作员飞书
  → 等待用户扫码（或回复「已扫码」）
  → 核对发表记录「已发表」
```

## 可行性结论（实测）

| 能力 | 结论 | 说明 |
|------|------|------|
| Chrome 截取验证码 | ✅ 可行 | 弹窗含 `image "微信二维码"`；`take_screenshot` 或整页截图 |
| lark-cli 发文本 | ✅ 可行 | `im +messages-send --as bot --user-id ou_xxx --text ...` |
| lark-cli 发图片 | ✅ 可行 | `--image` 相对路径；自动上传后投递 |
| 手机飞书查看后扫码 | ✅ 可行 | 需码未过期；裁剪/只截 QR 更易扫 |
| 完全无人值守 | ❌ 不可行 | 扫码必须真人；码有时效 |

### 实测注意

1. **代理**：系统代理开启时，访问 `accounts.feishu.cn/oauth/v3/token` 可能 `context deadline exceeded`。发飞书前应清空：

```bash
# bash
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY

# PowerShell
$env:http_proxy=''; $env:https_proxy=''; $env:HTTP_PROXY=''; $env:HTTPS_PROXY=''; $env:ALL_PROXY=''
```

2. **路径**：`lark-cli im +messages-send --image` **拒绝绝对路径**与 `..`，必须用相对当前工作目录的路径。  
3. **身份**：`bot` 身份即可私聊用户（应用可用范围需包含该用户）。`user` token 过期不影响 bot 发图。  
4. **历史截图不可复用授权**：过期 ticket 的截图只能测链路，不能再扫。  

## 前置条件

### 工具

- `lark-cli` 已安装（`lark-cli --help`）  
- `lark-cli auth status` 中 **bot: ready**  
- 可选：`lark-cli update` 保持 CLI 较新  

### 配置（仅目标环境，勿写入 Skill 真值）

```env
# 操作员飞书 open_id（推荐私聊）
FEISHU_NOTIFY_OPEN_ID=ou_xxxxxxxx

# 或群聊 chat_id（与 open_id 二选一）
# FEISHU_NOTIFY_CHAT_ID=oc_xxxxxxxx

# 是否启用二维码推送
FEISHU_QR_NOTIFY_ENABLED=true
```

获取 open_id：

```bash
lark-cli auth status
# 或联系管理后台 / contact 搜索
```

### 权限

Bot 需具备发消息与上传图片相关 scope（如 `im:message`、`im:resource` 等，以控制台为准）。  
应用**可用范围**必须包含接收人，否则 bot 无法私聊。

## 检测「微信验证」弹窗

在「继续发表」之后：

1. `take_snapshot` 或 `evaluate_script`  
2. 命中特征（任一）：  

| 特征 | 示例 |
|------|------|
| 标题文案 | `微信验证` |
| 说明文案 | `扫码后，请联系管理员进行验证` |
| 图片 | accessibility 名 `微信二维码`，或 `img` 的 `src` 含 `safeqrcode` |
| URL 形态 | `https://mp.weixin.qq.com/safe/safeqrcode?ticket=...` |

伪代码：

```js
() => {
  const text = document.body.innerText || '';
  const hasTitle = text.includes('微信验证');
  const qrImg = Array.from(document.querySelectorAll('img'))
    .find(i => (i.alt || '').includes('二维码') || (i.src || '').includes('safeqrcode'));
  return {
    needScan: hasTitle || !!qrImg,
    qrSrc: qrImg ? qrImg.src.slice(0, 200) : null
  };
}
```

## 截取二维码（按推荐顺序）

### 方式 A：只截 QR 图片节点（推荐）

1. snapshot 找到 `微信二维码` 对应 uid  
2. `take_screenshot` 传入该 `uid`，`filePath` 写到当日包：  

```text
output/YYYY-MM-DD/wechat-verify-qr.png
```

优点：图干净、手机易扫。

### 方式 B：整页 / 视口截图

```text
take_screenshot → output/YYYY-MM-DD/publish-verify-qr.png
```

优点：实现简单。  
缺点：码偏小；可后处理中心区域裁剪（见模板脚本思路）。

### 方式 C：下载 `safeqrcode` URL

若能拿到带登录态的图片 URL，可在浏览器上下文中 fetch 并落盘，画质通常最好。  
注意：ticket 有时效，URL 不要写入公开仓库。

## 推送到飞书（标准命令）

在**项目工作目录**下执行（保证相对路径合法）：

```bash
# 1) 清代理（强烈建议）
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY

# 2) 说明文字
lark-cli im +messages-send --as bot \
  --user-id "$FEISHU_NOTIFY_OPEN_ID" \
  --text "【公众号发表】请用管理员微信扫码完成验证（二维码有时效，请尽快）。标题：<文章标题>"

# 3) 图片（相对路径）
lark-cli im +messages-send --as bot \
  --user-id "$FEISHU_NOTIFY_OPEN_ID" \
  --image "output/YYYY-MM-DD/wechat-verify-qr.png"
```

群聊改用：

```bash
lark-cli im +messages-send --as bot \
  --chat-id "$FEISHU_NOTIFY_CHAT_ID" \
  --image "output/YYYY-MM-DD/wechat-verify-qr.png"
```

成功响应示例字段：

```json
{
  "ok": true,
  "identity": "bot",
  "data": {
    "chat_id": "oc_xxx",
    "message_id": "om_xxx",
    "create_time": "..."
  }
}
```

将 `message_id`、本地图片路径写入 `publish-status.json` 或 `feishu-notify.json` 便于审计。

### PowerShell 示例

见 `templates/feishu-qr-notify.example.ps1`。

### Bash 示例

见 `templates/feishu-qr-notify.example.sh`。

## 等待扫码与成功判定

1. 推送后告知用户：打开飞书 → 点开图片 → 管理员微信扫码  
2. 可选轮询（10–30s 间隔，最长数分钟）：  
   - 验证弹窗是否消失  
   - 或发表记录是否出现目标标题且状态 **已发表**  
3. 用户也可回复「已扫码」再立刻核对发表记录  

**超时**：提示重新走「发表 → 继续发表」拉**新码**，禁止狂点浪费群发次数。

## 与完整发表状态机的衔接

```text
… → 继续发表
  → [若微信验证]
       → 截码 + 飞书推送          ← 本文件
       → 等人扫码
  → [若运营规则答题]
       → 通知用户去后台答题（飞书可发文字提醒）
  → 发表记录「已发表」
  → 归档
```

详细点击顺序仍以 `browser-chrome-publish.md` 为准。

## 失败速查

| 现象 | 处理 |
|------|------|
| `Could not resolve host` / token deadline | 清代理重试；检查网络 |
| `--image` 路径 rejected | 改用 cwd 相对路径，去掉 `..` |
| bot 发不出去 | 检查应用可用范围、bot scope、open_id 是否正确 |
| 手机扫不了 | 改用节点截图；确认码未过期；放大图片 |
| 扫了无反应 | 必须管理员/运营者微信号；非管理员需管理员确认 |
| 发了旧图 | 禁止复用历史 ticket 截图 |

## 安全边界

- 不要把 `ticket=` 完整 URL、cookie、扫码截图提交进公开 git（截图可留在本机 `output/`，且 output 应 gitignore）  
- Skill 包只写占位 `FEISHU_NOTIFY_OPEN_ID`  
- 飞书消息可能含账号运营信息，注意群聊可见范围  

## 归档建议

```json
{
  "feishu_qr_notify": {
    "enabled": true,
    "sent_at": "2026-07-10T09:28:00+08:00",
    "open_id_or_chat": "ou_xxx",
    "local_image": "output/2026-07-10/wechat-verify-qr.png",
    "text_message_id": "om_xxx",
    "image_message_id": "om_xxx",
    "scan_status": "pending|done|timeout|expired_test_only"
  }
}
```

## Agent 执行清单（复制即用）

- [ ] `FEISHU_QR_NOTIFY_ENABLED` 且 open_id/chat_id 已配置  
- [ ] `lark-cli auth status` → bot ready  
- [ ] 发表流程到达「微信验证」  
- [ ] 截取 QR → 当日包路径  
- [ ] 清代理  
- [ ] 发文字 + 发图成功（ok: true）  
- [ ] 提示用户手机扫码  
- [ ] 核对「已发表」或超时重拉码  
