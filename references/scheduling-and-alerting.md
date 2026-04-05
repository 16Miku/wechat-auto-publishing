# Scheduling and Alerting

Use this reference when attaching automation to the workflow.

## Goal

Allow the article workflow to run on a schedule while keeping failures visible.

## Wrapper script responsibilities

A local wrapper should:
- create a dated or timestamped workspace
- gather source material
- draft the article
- prepare images
- publish to draft
- optionally publish formally
- save result artifacts
- notify on failure

## Example schedule shapes

Typical schedules may include morning and afternoon publication windows.

## Logging

Keep at least:
- stdout/stderr log file
- structured publish result artifact
- optional append-only JSONL execution log

## Minimum alerts

Alert on:
- token retrieval failure
- draft publish failure
- formal submit failure
- poll timeout
- missing final article URL
- image preparation failure without fallback
- gallery underflow
- IP 白名单变更告警：公网 IP 可能因运营商变化而改变，建议定期检查出口 IP 是否与白名单一致
- 代理状态告警：如果依赖代理访问 Google API，代理不可用时 AI 生图会失败，需监控代理可达性

## publish_status 状态码说明

正式发布后轮询 `publish_status` 字段含义：
- `0`：发布成功
- `1`：发布中（需继续轮询）
- `2`：原创审核中（已提交，等待审核）
- 其他值：发布失败

## 轮询策略

正式发布后需要轮询获取最终发布结果：
- 轮询间隔：3 秒
- 最大轮询次数：30 次（共 90 秒）
- 超时处理：记录 `publish_id` 供后续手动查询，不视为发布失败
- 轮询接口：`GET https://api.weixin.qq.com/cgi-bin/freepublish/get?access_token=TOKEN`，POST body 包含 `publish_id`

## 归档格式

`full_publish_result.json` 应包含以下完整字段：
- `publish_id`：发布任务 ID
- `article_id`：文章永久 ID
- `article_url`：文章访问链接
- `publish_status`：发布状态码（见上方状态码说明）
- `media_id`：草稿 media_id
- `title`：文章标题
- `timestamp`：发布时间戳

## Scheduler examples

See `templates/cron.example.txt` for a cron-style example and `templates/run.sh` for a wrapper starting point.
