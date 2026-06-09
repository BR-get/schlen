# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概览

Schlen联邦共和国官方网站 — 虚构互联网微国家，纯静态 HTML/CSS/JS。部署在 GitHub Pages，域名 schlen.top。

## 页面列表

| 页面 | 文件 | 说明 |
|---|---|---|
| 首页 | `index.html` | Hero + 信息卡片 + Waline 评论 |
| 关于 | `about.html` | 地理位置、人口、首都 |
| 文化 | `culture.html` | Boryoki 语言、常用短语 |
| 政体 | `government.html` | 全体共识制 + 信任委托可视化 + BR-penkein-coin 激励 |
| 公民 | `citizens.html` | 公民权益、入籍申请、论坛预览 |
| 动态 | `news.html` | 占位页面，暂无实际内容 |
| 钱包 | `wallet.html` | BR-penkein-coin 钱包（最复杂的页面） |
| 支持 | `support.html` | 联系方式、邮件模板、FAQ |
| 下载 | `down.html` | 国旗下载 |
| X | `x.html` | 自动跳转到 X/Twitter |
| 404 | `404.html` | 自定义错误页（不使用 components.js） |

> 注意：`constitution.html` 和 `laws.html` 曾引用但已移除链接，不要再引用这两个文件。

## 架构

### 共享组件系统 (`components.js`)
除 404 外的每个页面都调用 `initPage('pageId')`，该函数渲染以下三个容器：
- `<div id="header-root">` — 顶部导航栏（Logo + NAV_ITEMS + "加入国籍"按钮 + 主题切换）
- `<div id="footer-root">` — 页脚（NAV_ITEMS + FOOTER_LINKS 中的链接）
- `<div id="modal-root">` — 入籍申请弹窗（打开 mailto 链接）

关键全局变量和函数：`NAV_ITEMS`（主导航）、`FOOTER_LINKS`（底部链接）、`initPage()`、`initThemeToggle()`、`initJoinModal()`

### 主题系统
- 在 `<html>` 上设置 `data-theme="dark"` 属性切换暗色模式
- 偏好存储在 `localStorage.schlen_theme`
- 暗色模式样式集中在 `style.css` 的 `[data-theme="dark"]` 选择器下
- 钱包页面有自己的独立暗色样式（内联 `<style>`）

### 评论系统 (Waline)
除 404 外的每个页面用相同的配置初始化 Waline：
```js
Waline.init({
  el: '#waline',
  serverURL: 'https://blogwaline-gamma.vercel.app',
  // ... 其余选项与其他页面一致
})
```
暗色模式通过 `dark: 'html[data-theme="dark"]'` 支持。

### BR-penkein-coin 钱包 (`wallet.html`)
最复杂的页面，完全自包含 — 有自己的内联 `<style>` 和 `<script>`（不使用 `script.js`）。从 components.js 调用 `initThemeToggle()` 实现钱包页面的主题切换。API 地址 `https://coin.schlen.top`：

- `GET /balance?user=X` — 查询余额（公开）
- `GET /users` — 用户列表（公开）
- `GET /userinfo?user=X` — 用户详情（公开）
- `POST /transfer` — 需要 `X-API-Key` 请求头，body: `{from, to, amount}`
- `POST /mint` — 仅管理员，body: `{user, amount}`
- `POST /admin` — 仅管理员，body: `{action, user, value}`（支持 deduct、freeze、unfreeze、setBalance、deleteUser）
- API Key 以 `brkey_` 开头的是普通用户密钥，其他格式视为管理员密钥

### `script.js`
在需要弹窗或钱包功能的页面加载（index、about、citizens、news、government、culture、down、support）。通过 `DOMContentLoaded` 控制入籍弹窗和 BR-penkein-coin 钱包操作。使用 `fetchWithTimeout()` 包装器处理超时。

### 部署
- `CNAME` 文件配置 GitHub Pages 自定义域名
- 推送到 `main` 分支后自动通过 GitHub Actions / Pages 部署

## 添加新页面

1. 创建 `.html` 文件，在 body 中添加 `<div id="header-root">`、`<div id="footer-root">`、`<div id="modal-root">`
2. 加载 `components.js`，调用 `initPage('yourPageId')`
3. 添加 Waline 初始化代码块（从任意页面复制）
4. 在 `components.js` 的 `NAV_ITEMS` 数组中添加页面 ID（次要页面则加到 `FOOTER_LINKS`）
5. 如需自定义渐变色，在 `style.css` 中添加对应的 page-hero 背景类

## 重要规则

- **人口数字（3人）**：修改时需更新所有显示人口的文件 — 目前有 `index.html`、`about.html`、`citizens.html`。新增页面也要注意。
- **Waline 服务端地址**：`https://blogwaline-gamma.vercel.app` — 除非迁移评论后端，否则不要修改
- **Google Analytics 跟踪 ID**：每个页面的 `<head>` 中都使用 `G-BCG1K6EZ72`
- **components.js 的修改**会同时影响所有页面

## 样式约定

- CSS 变量定义在 `:root` 和 `[data-theme="dark"]` 中：`--primary-color`、`--accent-color`、`--bg-light`、`--card-bg`、`--text-dark` 等
- 海洋主题：蓝色系（主色 #007BFF），珊瑚橙点缀（#FFA726）
- 钱包页面有独立的 CSS 命名空间（`.wallet-page`、`.wallet-box` 等），与主站样式无冲突
- 所有页面引用 Google Fonts：Montserrat + Pacifico
