#!/usr/bin/env node

/**
 * 备用发布脚本 - 微信公众号文章发布
 *
 * 当 baoyu-post-to-wechat 因 jimp / simple-xml-to-json 等依赖
 * 在 Windows + Bun 环境下出现兼容性问题无法运行时，可使用本脚本替代。
 *
 * 特点：纯 Node.js 实现，零第三方依赖。
 *
 * 用法：
 *   1. 将本文件复制到工作目录（与 article.md、cover.png 同级）
 *   2. 确保 .baoyu-skills/.env 中配置了 WECHAT_APP_ID 和 WECHAT_APP_SECRET
 *   3. 运行: node publish.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// --- 基础配置 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 清除代理环境变量，确保直连微信 API
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.all_proxy;
delete process.env.ALL_PROXY;

const WX_API = 'https://api.weixin.qq.com';

// --- 工具函数 ---

/** 读取 .env 文件，返回键值对 */
function loadEnv(envPath) {
  const content = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // 去除引号
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

/** 解析 frontmatter（--- 包裹的 YAML 头部） */
function parseFrontmatter(md) {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: md };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body: match[2] };
}

/** 简易 Markdown -> HTML 转换 */
function markdownToHtml(md) {
  let html = md;

  // 图片 ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;" />');

  // 标题 h1-h6（h2 加样式增强视觉区分）
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 style="margin-top:1.5em;margin-bottom:0.5em;font-size:18px;font-weight:bold;border-left:4px solid #1e90ff;padding-left:10px;">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // 加粗 **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 斜体 *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 无序列表 - item
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // 行内代码 `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 段落处理：非空行包裹为 <p>，已有标签的行跳过，段落间加间距
  const lines = html.split('\n');
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push('');
    } else if (/^<(h[1-6]|ul|ol|li|img|blockquote|pre|code|hr|div|table|p)/.test(trimmed)) {
      result.push(trimmed);
    } else {
      result.push(`<p style="margin-bottom:1em;line-height:1.8;">${trimmed}</p>`);
    }
  }

  return result.filter(l => l !== '').join('\n');
}

/** 手动构建 multipart/form-data */
function buildMultipart(fields, files) {
  const boundary = '----NodeFormBoundary' + Math.random().toString(36).slice(2);
  const parts = [];

  for (const { name, value } of (fields || [])) {
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
      `${value}\r\n`
    );
  }

  for (const { name, filename, contentType, data } of (files || [])) {
    const header =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`;
    parts.push({ header, data });
  }

  // 组装为 Buffer
  const buffers = [];
  for (const part of parts) {
    if (typeof part === 'string') {
      buffers.push(Buffer.from(part, 'utf-8'));
    } else {
      buffers.push(Buffer.from(part.header, 'utf-8'));
      buffers.push(Buffer.isBuffer(part.data) ? part.data : Buffer.from(part.data));
      buffers.push(Buffer.from('\r\n', 'utf-8'));
    }
  }
  buffers.push(Buffer.from(`--${boundary}--\r\n`, 'utf-8'));

  return {
    body: Buffer.concat(buffers),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/** 带错误处理的 fetch 封装 */
async function wxFetch(url, options = {}) {
  console.log(`  -> ${options.method || 'GET'} ${url.split('?')[0]}`);
  const resp = await fetch(url, options);
  const data = await resp.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`微信 API 错误: ${data.errcode} - ${data.errmsg}`);
  }
  return data;
}

// --- 核心业务函数 ---

/** 步骤1: 获取 access_token */
async function getAccessToken(appId, appSecret) {
  console.log('\n[1/6] 获取 access_token...');
  const url = `${WX_API}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const data = await wxFetch(url);
  console.log(`  access_token: ${data.access_token.slice(0, 20)}...`);
  return data.access_token;
}

/** 步骤2: 上传封面图为永久素材，返回 thumb_media_id */
async function uploadCoverMaterial(token, coverPath) {
  console.log('\n[2/6] 上传封面图为永久素材...');
  const fileData = readFileSync(coverPath);
  const ext = coverPath.split('.').pop().toLowerCase();
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif' };
  const contentType = mimeMap[ext] || 'image/png';

  const { body, contentType: ct } = buildMultipart(
    [{ name: 'type', value: 'image' }],
    [{ name: 'media', filename: `cover.${ext}`, contentType, data: fileData }]
  );

  const url = `${WX_API}/cgi-bin/material/add_material?access_token=${token}&type=image`;
  const data = await wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': ct },
    body,
  });

  console.log(`  thumb_media_id: ${data.media_id}`);
  return data.media_id;
}

/** 步骤3: 上传文章内图片到微信（临时图片，返回微信 URL） */
async function uploadContentImage(token, imagePath) {
  console.log(`  上传图片: ${imagePath}`);
  const fileData = readFileSync(imagePath);
  const filename = imagePath.split(/[/\\]/).pop();
  const ext = filename.split('.').pop().toLowerCase();
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif' };
  const contentType = mimeMap[ext] || 'image/jpeg';

  const { body, contentType: ct } = buildMultipart(
    [],
    [{ name: 'media', filename, contentType, data: fileData }]
  );

  const url = `${WX_API}/cgi-bin/media/uploadimg?access_token=${token}`;
  const data = await wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': ct },
    body,
  });

  console.log(`  微信 URL: ${data.url}`);
  return data.url;
}

/** 步骤4: 处理文章内容，上传图片并替换路径 */
async function processArticle(token) {
  console.log('\n[3/6] 读取并解析 article.md...');
  const mdContent = readFileSync(join(__dirname, 'article.md'), 'utf-8');
  const { meta, body } = parseFrontmatter(mdContent);
  console.log(`  标题: ${meta.title}`);
  console.log(`  摘要: ${meta.summary}`);

  console.log('\n[4/6] 上传文章内图片...');
  // 找出所有本地图片引用
  const imgRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;
  const localImages = new Set();
  let match;
  while ((match = imgRegex.exec(body)) !== null) {
    localImages.add(match[2]);
  }

  // 上传每张图片，建立映射
  const imageUrlMap = {};
  for (const imgFile of localImages) {
    const imgPath = join(__dirname, imgFile);
    if (!existsSync(imgPath)) {
      console.log(`  警告: 图片不存在 ${imgFile}，跳过`);
      continue;
    }
    const wxUrl = await uploadContentImage(token, imgPath);
    imageUrlMap[`./${imgFile}`] = wxUrl;
  }

  console.log('\n[5/6] 转换 Markdown 为 HTML...');
  // 先替换图片路径再转 HTML
  let processedBody = body;
  for (const [local, wxUrl] of Object.entries(imageUrlMap)) {
    processedBody = processedBody.split(local).join(wxUrl);
  }

  const htmlContent = markdownToHtml(processedBody);
  console.log(`  HTML 长度: ${htmlContent.length} 字符`);

  return { meta, htmlContent };
}

/** 步骤5: 创建草稿 */
async function createDraft(token, thumbMediaId, title, content, digest, author) {
  console.log('\n[6/7] 创建草稿...');
  const url = `${WX_API}/cgi-bin/draft/add?access_token=${token}`;

  const article = {
    title,
    author: author || '',
    digest: digest || '',
    content,
    thumb_media_id: thumbMediaId,
    need_open_comment: 0,
    only_fans_can_comment: 0,
  };

  const data = await wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles: [article] }),
  });

  console.log(`  草稿 media_id: ${data.media_id}`);
  return data;
}

/** 步骤6: 正式发布 */
async function freePublish(token, mediaId) {
  console.log('\n[7/7] 提交正式发布...');
  const url = `${WX_API}/cgi-bin/freepublish/submit?access_token=${token}`;
  const data = await wxFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_id: mediaId }),
  });
  const publishId = data.publish_id;
  console.log(`  publish_id: ${publishId}`);

  // 轮询发布状态
  console.log('  轮询发布状态...');
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const statusUrl = `${WX_API}/cgi-bin/freepublish/get?access_token=${token}`;
    const statusData = await wxFetch(statusUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish_id: publishId }),
    });
    const status = statusData.publish_status;
    console.log(`  第${i + 1}次查询: publish_status=${status}`);
    if (status === 0) {
      // 发布成功
      const articleId = statusData.article_id;
      const articleUrl = statusData.article_detail?.item?.[0]?.article_url || '';
      console.log(`  发布成功! article_id: ${articleId}`);
      if (articleUrl) console.log(`  文章 URL: ${articleUrl}`);
      return { publish_id: publishId, article_id: articleId, article_url: articleUrl, publish_status: 0 };
    } else if (status === 2) {
      // 原创审核中
      const articleId = statusData.article_id;
      console.log(`  原创审核中，article_id: ${articleId}`);
      return { publish_id: publishId, article_id: articleId, article_url: '', publish_status: 2 };
    } else if (status === 1) {
      // 发布中，继续轮询
      continue;
    } else {
      console.log(`  发布失败，status: ${status}`);
      return { publish_id: publishId, publish_status: status };
    }
  }
  console.log('  轮询超时，请手动检查发布状态');
  return { publish_id: publishId, publish_status: -1 };
}

// --- 主流程 ---

async function main() {
  console.log('=== 微信公众号文章发布脚本 ===\n');

  // 加载环境变量
  const envPath = join(__dirname, '.baoyu-skills', '.env');
  if (!existsSync(envPath)) {
    console.error(`错误: 找不到 .env 文件: ${envPath}`);
    process.exit(1);
  }
  const env = loadEnv(envPath);
  const appId = env.WECHAT_APP_ID;
  const appSecret = env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('错误: .env 中缺少 WECHAT_APP_ID 或 WECHAT_APP_SECRET');
    process.exit(1);
  }
  console.log(`AppID: ${appId.slice(0, 6)}...`);

  try {
    // 1. 获取 token
    const token = await getAccessToken(appId, appSecret);

    // 2. 上传封面图
    const coverPath = join(__dirname, 'cover.png');
    const thumbMediaId = await uploadCoverMaterial(token, coverPath);

    // 3-5. 处理文章并上传图片
    const { meta, htmlContent } = await processArticle(token);

    // 6. 创建草稿
    const result = await createDraft(
      token,
      thumbMediaId,
      meta.title || '未命名文章',
      htmlContent,
      meta.summary || '',
      meta.author || ''
    );

    // 7. 正式发布
    const publishResult = await freePublish(token, result.media_id);

    // 保存结果
    const outputDir = join(__dirname, 'output');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const fullResult = {
      success: true,
      timestamp: new Date().toISOString(),
      media_id: result.media_id,
      title: meta.title,
      summary: meta.summary,
      author: meta.author,
      thumb_media_id: thumbMediaId,
      publish_id: publishResult.publish_id,
      article_id: publishResult.article_id || '',
      article_url: publishResult.article_url || '',
      publish_status: publishResult.publish_status,
    };

    const outputPath = join(outputDir, 'full_publish_result.json');
    writeFileSync(outputPath, JSON.stringify(fullResult, null, 2), 'utf-8');

    console.log('\n=== 发布完成 ===');
    console.log(`结果已保存到: ${outputPath}`);
    console.log(JSON.stringify(fullResult, null, 2));

  } catch (err) {
    console.error('\n发布失败:', err.message);

    // 即使失败也保存错误信息
    const outputDir = join(__dirname, 'output');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    const errorResult = {
      success: false,
      timestamp: new Date().toISOString(),
      error: err.message,
    };
    const outputPath = join(outputDir, 'full_publish_result.json');
    writeFileSync(outputPath, JSON.stringify(errorResult, null, 2), 'utf-8');
    console.error(`错误信息已保存到: ${outputPath}`);
    process.exit(1);
  }
}

main();
