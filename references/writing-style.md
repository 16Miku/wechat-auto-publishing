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

For numbered subheads, use `##` heading with `、` separator for better visual distinction in WeChat:

```markdown
## 1、第一个小标题
```

This renders as a styled h2 heading with a blue left border in WeChat, providing clear visual separation between sections.

## Suggested publish-ready pattern

```markdown
---
title: 文章标题
author: 作者名
summary: 一句话摘要
cover: ./cover.png
---

![image](./image1.jpg)

开头第一句直接抛情绪。

## 1、第一个小标题

这里写正文。

## 2、第二个小标题

这里写正文。

## 3、我的操作？

这里写态度。

## 4、明日观察重点：

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

## WeChat formatting lessons learned

1. **标题格式**：推荐使用 `## 1、标题` 格式而非纯文本数字编号，在微信中渲染为带样式的二级标题（蓝色左边框），视觉区分度更好
2. **避免重复标题**：frontmatter 中已有 title 字段，正文不要再用 `# 标题` 重复，否则微信显示会出现两个标题
3. **段落间距**：每个话题/模块之间需要空行分隔，否则文字混在一起难以阅读
4. **作者名**：在 frontmatter 的 author 字段设置即可，不要在正文中重复写作者名
