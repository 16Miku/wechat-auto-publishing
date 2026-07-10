# 多账号切换与自检（Browser 实战）

同一台 Chrome、同一 Agent 会话里切换公众号时，**必须先确认当前登录的是哪个号**，再写作者、建草稿、对发表记录。

已在真实环境验证：例如从「天成财策分析」切到「牛股杀手」后，`token` 查询参数、草稿列表、发表记录均独立变化。

## 原则

```text
一号一登录态（Chrome 后台切换账号）
  → Agent 自检账号名 + token
  → 作者字段 = 当前号显示名
  → 草稿 / 发表 / 归档按账号区分
```

通道 A（API）仍建议：**一号一工作目录 + 一号一 `.env`**，避免 AppID 串号。

## 换号后 Agent 自检清单（必做）

在动笔或点「新的创作」之前：

### 1. 打开首页或草稿箱

```text
list_pages → 选中含 mp.weixin.qq.com 的标签
navigate 或确认 URL 含 /cgi-bin/home 或 appmsg list_card
```

### 2. 读取账号显示名

优先从页面可见文案读取，例如：

- 顶栏 / 账号区：`牛股杀手`、`天成财策分析`
- `document.body.innerText` 中「公众号 已认证」附近昵称

**不要**沿用上一会话缓存的账号名。

### 3. 读取 URL 中的 `token=`

```text
https://mp.weixin.qq.com/cgi-bin/...?token=1988190763&lang=zh_CN
```

- 不同号 → 不同 token  
- 同一会话内 token 会变：说明已切号或重新登录  
- **禁止**把真实 token 写入 skill 包或公开 git；仅运行时使用  

### 4. 向用户确认（推荐一句）

> 当前 Chrome 登录号显示为「{name}」，将向该号发文，是否正确？

用户否定则停止，等其在后台切对号。

### 5. 自检脚本示意

```js
() => {
  const url = location.href;
  const token = (url.match(/token=(\d+)/) || [])[1] || null;
  const text = (document.body.innerText || '').replace(/\s+/g, ' ');
  // 粗提取：取「通知中心」后、常见导航后的短昵称需结合 snapshot
  return {
    url: url.slice(0, 120),
    token,
    // 结合 a11y snapshot 中账号 StaticText 更稳
    pageTitle: document.title
  };
}
```

更稳：用 `take_snapshot` 找顶栏账号 `StaticText`（如 `uid=… StaticText "牛股杀手"`）。

## 作者字段规则（`#author`）

| 规则 | 说明 |
|------|------|
| **默认** | 填**当前号对外显示名**（与顶栏一致） |
| **禁止** | 无确认地复用上一号作者（如仍写「天成财策分析」发到「牛股杀手」） |
| **覆盖** | 仅当用户明确指定作者笔名时改用指定值 |
| **API** | frontmatter `author` 与 EXTEND `default_author` 按账号配置；多账号用多目录/多 env |

Browser 写入：

```js
// #author = 当前自检得到的 account_display_name
```

## 同文跨号复用

| 可复用 | 不可直接复用 |
|--------|----------------|
| 标题、正文、摘要文案 | 上一号的 `appmsgid` / `media_id` |
| 本地 `image1.jpg` / `image2.jpg` / beauty 源文件 | 上一号封面 CDN URL |
| 提示词与结构模板 | 上一号发表记录链接 |
| 飞书推码流程本身 | 过期二维码截图 |

操作：

1. 自检新号  
2. 作者改为新号显示名  
3. 新建草稿（不要编辑他号草稿）  
4. 重新上传配图、设封面  
5. 归档文件名带账号 slug，避免覆盖  

## 归档命名建议

```text
output/YYYY-MM-DD/
  article.md                         # 可共用正文
  image1.jpg / image2.jpg            # 可共用素材
  {account_slug}-draft-result.json
  {account_slug}-publish-status.json
  {account_slug}-wechat-verify-qr.png
```

示例 slug：`tiancheng`、`niugu`（仅本地约定，勿写死隐私路径）。

`publish-status.json` 必填字段：

```json
{
  "account": "牛股杀手",
  "account_slug": "niugu",
  "title": "…",
  "appmsgid": "…",
  "published_at": "…",
  "publish_state": "已发表"
}
```

## 发表记录核对必须带账号上下文

核对 URL 使用**当前 token**：

```text
/cgi-bin/appmsgpublish?sub=list&begin=0&count=10&token={current}&lang=zh_CN
```

成功标准：

- 页眉账号名正确  
- 目标标题出现  
- 状态为 **已发表**  
- 时间接近本次操作  

不要用另一号的发表记录页当证据。

## 与目录隔离（API / 长期运营）

| 模式 | 做法 |
|------|------|
| Browser 临时换号 | 同一工作区 + 自检 + 归档分文件名 |
| API / 定时 / 多密钥 | **一号一目录**：独立 `.env`、title 历史、cron、output |

## 故障

| 现象 | 处理 |
|------|------|
| 发到了错号 | 停；自检顶栏名与 token；用户确认后重来 |
| 作者仍是旧号 | 重写 `#author` 为当前显示名 |
| 发表记录找不到文 | 是否看错号的 token/记录页 |
| 切号提示未授权 | 「我知道了」关闭；勿点退出登录除非用户要求 |

## Agent 最小检查单

- [ ] snapshot/文案中的账号名 = 用户期望号  
- [ ] URL `token` 已刷新（与换号前不同则正常）  
- [ ] `#author` = 当前显示名（或用户指定笔名）  
- [ ] 新建草稿而非打开他号旧稿  
- [ ] 归档文件名含账号标识  
- [ ] 发表记录在**本号**页核对  
