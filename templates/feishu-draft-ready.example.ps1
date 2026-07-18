# API 草稿成功后：飞书通知管理员去 mp 后台手动发表（PowerShell）
# 用法（项目根目录）：
#   $env:FEISHU_NOTIFY_OPEN_ID = "ou_xxx"
#   $env:WECHAT_ACCOUNT_DISPLAY_NAME = "账号显示名"
#   .\templates\feishu-draft-ready.example.ps1 -Title "标题" -Summary "摘要" -MediaId "media_id" [-CoverRel "output/2026-07-10/cover.jpg"]

param(
  [Parameter(Mandatory = $true)][string]$Title,
  [Parameter(Mandatory = $true)][string]$Summary,
  [Parameter(Mandatory = $true)][string]$MediaId,
  [string]$CoverRel = ""
)

$ErrorActionPreference = "Stop"

if (-not $env:FEISHU_NOTIFY_OPEN_ID -and -not $env:FEISHU_NOTIFY_CHAT_ID) {
  throw "Set FEISHU_NOTIFY_OPEN_ID or FEISHU_NOTIFY_CHAT_ID"
}

$account = if ($env:WECHAT_ACCOUNT_DISPLAY_NAME) { $env:WECHAT_ACCOUNT_DISPLAY_NAME } else { "（未配置账号名）" }
$mpHome = if ($env:WECHAT_MP_HOME_URL) { $env:WECHAT_MP_HOME_URL } else { "https://mp.weixin.qq.com/" }

$env:http_proxy = ""; $env:https_proxy = ""; $env:HTTP_PROXY = ""; $env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""; $env:all_proxy = ""

$target = @()
if ($env:FEISHU_NOTIFY_OPEN_ID) {
  $target = @("--user-id", $env:FEISHU_NOTIFY_OPEN_ID)
} else {
  $target = @("--chat-id", $env:FEISHU_NOTIFY_CHAT_ID)
}

$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$text = @"
【待发布·草稿已进箱】

账号：$account
标题：$Title
摘要：$Summary
media_id：$MediaId
时间：$now

请管理员：
1. 打开管理后台（确认右上角是本账号）
2. 内容管理 → 草稿箱
3. 按标题打开本文 → 检查封面/正文 → 点「发表」

管理后台：
$mpHome

说明：流水线仅完成 API 草稿 + 本通知，不自动正式发表（避免 freepublish 可见性异常）。
"@

& lark-cli im +messages-send --as bot @target --text $text

if ($CoverRel) {
  $CoverRel = $CoverRel -replace "\\", "/"
  if ($CoverRel.StartsWith("/") -or $CoverRel.Contains("..")) {
    throw "Cover path must be cwd-relative without .."
  }
  if (Test-Path -LiteralPath $CoverRel) {
    & lark-cli im +messages-send --as bot @target --image $CoverRel
  }
}

Write-Host "draft-ready notify sent: $Title"
