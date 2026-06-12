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
| 政体 | `government.html` | 液态民主（直接投票 + 信任委托）+ BR-penkein-coin 激励 |
| 公民 | `citizens.html` | 公民权益、入籍申请、论坛预览 |
| 动态 | `news.html` | 欢迎公告、社区动态 |
| 钱包 | `wallet.html` | BR-penkein-coin 钱包（最复杂的页面） |
| 支持 | `support.html` | 联系方式、邮件模板、FAQ |
| 下载 | `down.html` | 国旗下载 |
| X | `x.html` | X/Twitter 关注页面，手动跳转 |
| 404 | `404.html` | 自定义错误页（不使用 components.js） |

## 架构

### 公共资源注入 (`components.js`)
除 404 外的所有页面不直接在 HTML 中加载 CDN 资源和第三方脚本。`components.js` 在初始化时会自动调用以下函数注入：
- `injectCommonHead()` — 注入 Font Awesome、MI Sans 字体、Pacifico 字体、Waline CSS
- `initGA()` — 注入 Google Analytics (`G-BCG1K6EZ72`)
- `initWaline()` — 自动检测 `<div id="waline">`，存在则加载 Waline.js 并初始化

### 共享组件系统 (`components.js`)
除 404 外的每个页面调用 `initPage('pageId')`，该函数渲染以下三个容器：
- `<div id="header-root">` — 顶部导航栏（Logo + NAV_ITEMS + "加入国籍"按钮 + 主题切换）
- `<div id="footer-root">` — 页脚（NAV_ITEMS + FOOTER_LINKS 中的链接）
- `<div id="modal-root">` — 入籍申请弹窗（打开 mailto 链接）

关键全局变量和函数：`NAV_ITEMS`（主导航）、`FOOTER_LINKS`（底部链接）、`initPage()`、`injectCommonHead()`、`initGA()`、`initWaline()`、`renderFooter()`、`initThemeToggle()`、`initJoinModal()`

### 每个页面的 `<head>` 结构
所有页面（除 404 外）的 `<head>` 只包含：
- `<meta charset>`、`<meta viewport>`、`<meta description>`、`<title>`
- OG / Twitter Card 元标签（`og:image` 统一为 `https://schlen.top/国旗.png`）
- `<link rel="icon">`、`<link rel="stylesheet" href="style.css">`
- 其余 CDN 资源（FA、字体、Waline CSS）均由 `components.js` 动态注入

### 样式组织
所有样式集中在 `style.css`（原各页面的内联 `<style>` 已全部迁移），按页面分区管理：
- `/* ===== Support Page Styles ===== */`
- `/* ===== Download Page Styles ===== */`
- `/* ===== Government Page Styles ===== */`
- `/* ===== News Page Styles ===== */`
- `/* ===== Wallet Page Styles ===== */`

### 主题系统
- 在 `<html>` 上设置 `data-theme="dark"` 属性切换暗色模式
- 偏好存储在 `localStorage.schlen_theme`
- 暗色模式样式集中在 `style.css` 的 `[data-theme="dark"]` 选择器下

### 评论系统 (Waline)
`components.js` 的 `initWaline()` 自动处理，serverURL 为 `https://blogwaline-gamma.vercel.app`，暗色模式通过 `dark: 'html[data-theme="dark"]'` 支持。页面只需放置 `<div id="waline"></div>`，无需手动加载 Waline 脚本。

### 图标系统
- Font Awesome 6 由 `components.js` 动态注入
- 404 页面因不使用 components.js，在其 `<head>` 中直接加载 FA

### 字体
- 主字体：MI Sans（小米字体），Logo 字体：Pacifico（Google Fonts）
- 由 `style.css` 的 `@import` 加载（@import 位于文件顶部，优先于 JS 注入）
- `components.js` 的 `injectCommonHead()` 也加载字体（缓存命中，无额外开销）

### Telegram 群组
- 唯一群组链接：`https://t.me/+a7w9EUeKBThlY2Y5`
- 全站多个入口（首页、支持页、公民页、关于页、政体页、动态页、页脚）
- 引导用户到 #SCHLEN治理部 话题参与讨论

### BR-penkein-coin 钱包 (`wallet.html`)
最复杂的页面，使用内联 `<script>` 完成所有钱包逻辑。不调用 `initPage()`，而是单独调用 `renderFooter()` + `initThemeToggle()` + `initWaline()`。API 地址 `https://coin.schlen.top`：

- `GET /balance?user=X` — 查询余额
- `GET /users` — 用户列表
- `GET /userinfo?user=X` — 用户详情
- `POST /transfer` — 需要 `X-API-Key` 请求头，body: `{from, to, amount}`
- `POST /mint` — 仅管理员，body: `{user, amount}`
- `POST /admin` — 仅管理员，body: `{action, user, value}`（支持 deduct、freeze、unfreeze、setBalance、deleteUser）
- API Key 以 `brkey_` 开头的是普通用户密钥，否则视为管理员密钥

### 部署
- `CNAME` 文件配置 GitHub Pages 自定义域名
- 推送到 `main` 分支后自动通过 GitHub Actions / Pages 部署

## 添加新页面

1. 创建 `.html` 文件，在 `<head>` 中：charset、viewport、description、title、OG 标签、favicon、style.css
2. 在 body 中添加 `<div id="header-root">`、`<div id="footer-root">`、`<div id="modal-root">`
3. 如需评论区，添加 `<div id="waline"></div>`（Waline 由 components.js 自动初始化）
4. 在 body 末尾加载 `<script src="components.js"></script>` 并调用 `initPage('yourPageId')`
5. 在 `components.js` 的 `NAV_ITEMS` 数组中添加页面 ID（次要页面则加到 `FOOTER_LINKS`）
6. 如需自定义渐变色，在 `style.css` 中添加对应的 page-hero 背景类

## 重要规则

- **人口数字（3人）**：修改时需更新 `index.html`、`about.html`、`citizens.html`
- **Waline 服务端地址**：`https://blogwaline-gamma.vercel.app` — 除非迁移，否则不要修改
- **Google Analytics ID**：`G-BCG1K6EZ72` — 硬编码在 `components.js` 的 `initGA()` 中
- **OG 图片**：统一使用 `https://schlen.top/国旗.png`，如需更换在所有页面的 OG 标签中同步更新
- **Hero 背景**：使用 `国旗.png`，浅色/暗色模式各有不同的渐变叠加层，在 `style.css` 中维护
- **BR-penkein-coin 不是区块链货币**：不要使用区块、挖矿、账本、链等区块链术语
- **components.js 的修改**会同时影响所有页面
- **404 页面**不使用 components.js（没有 header/footer，完全独立），需自行加载 FA 和字体
- **喵喵喵讲话**：所有回复必须以「喵」「喵喵」「喵～」等猫叫风格讲话，每句话都带喵喵喵

## 样式约定

- CSS 变量定义在 `:root` 和 `[data-theme="dark"]` 中：`--primary-color`、`--accent-color`、`--bg-light`、`--card-bg`、`--text-dark` 等
- 海洋主题：蓝色系（主色 #007BFF），珊瑚橙点缀（#FFA726）
- 钱包页面有独立的 CSS 命名空间（`.wallet-page`、`.wallet-box` 等），与主站样式无冲突
- 主字体为 MI Sans（小米字体），Logo 使用 Pacifico（Google Fonts），Font Awesome 6 用于图标
