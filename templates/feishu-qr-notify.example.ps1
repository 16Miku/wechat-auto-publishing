# 将微信验证二维码图片推送到飞书（bot）— PowerShell
# 用法（在项目根目录）：
#   $env:FEISHU_NOTIFY_OPEN_ID = "ou_xxx"
#   .\templates\feishu-qr-notify.example.ps1 -ImageRel "output\2026-07-10\wechat-verify-qr.png" -Title "文章标题"
#
# 注意：--image 使用正斜杠相对路径更稳妥

param(
  [Parameter(Mandatory = $true)]
  [string]$ImageRel,
  [string]$Title = "（未命名文章）"
)

$ErrorActionPreference = "Stop"

if (-not $env:FEISHU_NOTIFY_OPEN_ID -and -not $env:FEISHU_NOTIFY_CHAT_ID) {
  throw "Set FEISHU_NOTIFY_OPEN_ID or FEISHU_NOTIFY_CHAT_ID"
}

# 规范为相对路径，禁止 ..
$ImageRel = $ImageRel -replace "\\", "/"
if ($ImageRel.StartsWith("/") -or $ImageRel.Contains("..")) {
  throw "Image path must be cwd-relative without .. : $ImageRel"
}
if (-not (Test-Path -LiteralPath $ImageRel)) {
  throw "File not found: $ImageRel"
}

# 清代理，避免飞书 token 超时
$env:http_proxy = ""
$env:https_proxy = ""
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""
$env:all_proxy = ""

$text = @"
【公众号发表验证】请用管理员微信尽快扫码（二维码有时效）。
标题：$Title
若码失效，请在电脑后台重新点发表以刷新二维码。
"@

$target = @()
if ($env:FEISHU_NOTIFY_OPEN_ID) {
  $target = @("--user-id", $env:FEISHU_NOTIFY_OPEN_ID)
} else {
  $target = @("--chat-id", $env:FEISHU_NOTIFY_CHAT_ID)
}

& lark-cli im +messages-send --as bot @target --text $text
& lark-cli im +messages-send --as bot @target --image $ImageRel

Write-Host "Feishu QR notify sent for: $ImageRel"
