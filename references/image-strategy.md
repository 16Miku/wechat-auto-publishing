# Image Strategy

准备 `cover.png`（或 `cover.jpg`）、`image1.jpg`、`image2.jpg`。

## Output contract

统一文件名：

```text
cover.png | cover.jpg
image1.jpg
image2.jpg
```

frontmatter：

```yaml
cover: ./cover.png
```

正文 Markdown：

```markdown
![image](./image1.jpg)
...
![image](./image2.jpg)
```

通道 B（浏览器）不依赖 Markdown 内嵌路径，但**本地包仍应保留同名文件**便于复用与审计。

## 来源矩阵（显式选择，禁止隐式）

| 来源 | 说明 | 典型用途 |
|------|------|----------|
| `user_prompt_direct` | 用户给出完整提示词，Agent **直接**调用图像生成工具（如 image_gen），**不**绕 baoyu-image-gen 扩展链路 | 指定风格美女图、定制场景 |
| `local_gallery` | 本地图库目录抽取 | 稳定存量素材（如 `美女配图/`） |
| `concept_ai` | 概念/财经插画风 AI 生成 | 封面科技感 |
| `user_upload` | 用户直接给文件 | 品牌物料 |

运行时在日志/`draft-result.json` 写明 `image_source`。

## 用户提示词直出（实战路径）

当用户提供完整中文/英文提示词并要求「直接生成、不要走 skill 内 baoyu 生图方式」时：

1. 使用当前环境的 **image_gen / 等价生图工具** 连续生成 2 张（可微调构图角度保持同一人设）  
2. 建议 `aspect_ratio: 16:9`（封面与正文通用；避免未支持的 `2.35:1` 等枚举）  
3. 保存到当日包：  

```text
output/YYYY-MM-DD/beauty1.jpg  → 同步为 image1.jpg / 可选封面
output/YYYY-MM-DD/beauty2.jpg  → 同步为 image2.jpg / 可选封面
output/YYYY-MM-DD/cover.png    ← 默认可用 beauty1 转 PNG；用户可改为 beauty2
```

4. 通道 B：`upload_file` 上传到编辑器；封面「从正文选择」对应张  

合规：

- 仅成年人形象；拒绝未成年/色情擦边  
- 适合公众号：干净、高级、非露骨  

## Cover 默认策略

若无用户指定：

- 概念风、冷色、少文字烘焙进图  
- 或使用正文首图 / 用户指定第 N 张正文图  

浏览器路径下，**以编辑器封面预览为准**；用户手动改封面后，归档 `cover_note`。

## Local gallery mode

```text
<gallery-root>/
├─ unused/   # 或扁平目录如 美女配图/*.jpg
├─ used/
└─ bad/
```

规则：

- 每篇选 2 张，不重复  
- 仅允许 `.jpg/.jpeg/.png/.webp`  
- **发布成功前不移动**到 used（失败则留在 unused）  
- 库存低于阈值报警  

配置示例见 `templates/gallery-config.example.txt`。

## AI 概念生图（可选 baoyu 链路）

若走 `baoyu-image-gen` / `baoyu-cover-image`：

- 注意代理 API 模型名是否 404  
- 生图阶段可代理；上传微信阶段须直连  
- 失败分级见文末  

## 尺寸建议

| 用途 | 建议 |
|------|------|
| 封面 | 16:9 或接近宽屏；微信后台可再裁 |
| 正文 | 16:9 或 3:2 |
| 体积 | 通常 < 4MB；接口上限约 10MB |

## 质检门禁

发布前检查：

- [ ] 文件存在且非空  
- [ ] 可解码  
- [ ] **真实格式**与扩展名一致（防 HEIF 伪装 → 微信 40113）  
- [ ] 通道 B 上传后 `src` 含 `mmbiz.qpic.cn` 且宽高 > 0  

规范化：封面 PNG/JPEG；正文优先 JPEG。

## 失败分级

| 级别 | 情况 | 动作 |
|------|------|------|
| L1 | AI 失败但有图库/用户图 | 继续 |
| L2 | 无正文图但有封面 | 仅当流程明确允许 |
| L3 | 无封面且无回退 | **阻断** |
| L4 | 格式伪合法 | 重编码后重试 |

## 与双通道的关系

| 步骤 | API | Browser |
|------|-----|---------|
| 本地生成/选型 | 相同 | 相同 |
| 上传 | material API | 编辑器「图片→本地上传」 |
| 封面 | thumb_media_id | 从正文选择 / 图库 |
| 替换 | 重新 draft | 删 img 节点再 upload_file |
