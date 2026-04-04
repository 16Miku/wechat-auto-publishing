# Writing Style

Use this reference when drafting the WeChat article body.

## Goal

Produce an article that is readable inside WeChat, emotionally direct, and visually light.

## Style principles

- lead with emotion before analysis
- keep paragraphs short
- write from a retail-reader viewpoint when that matches the target account style
- avoid formal report language unless the user explicitly wants it
- include a clear tomorrow-watchlist section
- preserve a light interaction-oriented ending

## Title guidance

Prefer short, emotionally punchy titles when the account style supports it.

## Opening guidance

Start directly with an emotion, reaction, complaint, or clear conclusion. Avoid long warm-up paragraphs.

## Body structure

A common shape is:
1. opening emotional reaction
2. several numbered sections
3. current stance / current operation
4. tomorrow watchlist
5. interaction-oriented ending

## Publishable Markdown conventions

Use explicit frontmatter:

```markdown
---
title: 文章标题
author: 作者名
summary: 一句话摘要
cover: ./cover.png
---
```

Use standard Markdown image syntax for body images:

```markdown
![image](./image1.jpg)
```

If internal numbered subheads should look like normal body text, prefer plain numbered lines such as:

```text
1，第一个小标题
```

instead of Markdown headings like:

```markdown
## 1，第一个小标题
```

## Suggested publish-ready pattern

```markdown
---
title: 文章标题
author: 作者名
summary: 一句话摘要
cover: ./cover.png
---

# 文章标题

![image](./image1.jpg)

开头第一句直接抛情绪。

1，第一个小标题

这里写正文。

2，第二个小标题

这里写正文。

3，我的操作？

这里写态度。

4，明日观察重点：

（1）观察点一

（2）观察点二

（3）观察点三

![image](./image2.jpg)

互动结尾。
```

## Avoid

Avoid these unless the user explicitly wants them:
- formal research-report phrasing
- oversized data dumps
- long theory-heavy paragraphs
- generic compliance-style endings
