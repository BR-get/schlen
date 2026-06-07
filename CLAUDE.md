# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Schlen联邦共和国官方网站 - 一个虚构的互联网微国家网站，纯静态HTML/CSS/JS项目，无需构建工具。

## 技术栈

- 纯 HTML + CSS + JavaScript
- Valine 评论系统
- Google Analytics (gtag.js)
- 字体: Montserrat, Pacifico (Google Fonts)

## 目录结构

```
├── *.html          # 各页面 (index, about, citizens, news, government 等)
├── components.js  # 共享组件 (导航栏、页脚、弹窗、主题切换)
├── script.js      # 页面交互逻辑 (入籍申请弹窗、BR-coin API)
├── style.css      # 全局样式 (含暗色模式)
└ └── 国旗.png    # 国家标志
```

## 常用操作

- **预览**: 直接在浏览器打开 index.html 或使用本地服务器
- **部署**: 推送到 GitHub 后自动通过 GitHub Pages 托管
- **修改页面**: 编辑对应的 .html 文件

## 重要规范

### 人口数字
当前人口为 **3人**，如需修改请同步更新以下文件:
- `index.html` - 首页人口
- `about.html` - 关于页面
- `citizens.html` - 公民专区
- `news.html` - 新闻动态

### 组件使用
所有页面共享 `components.js` 中的函数:
- `initPage('pageId')` - 初始化页面 (渲染header/footer)
- 导航配置在 `NAV_ITEMS` 数组中

### 暗色模式
通过 `data-theme="dark"` 属性控制，存储在 localStorage 的 `schlen_theme` 键

### 评论系统
Valine 配置在每个页面的 script 块中，使用 leancloud 后端