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

## Scheduler examples

See `templates/cron.example.txt` for a cron-style example and `templates/run.sh` for a wrapper starting point.
