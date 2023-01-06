# vitepress-blog

基于 vitepress 的静态博客生成，五分钟搭建一个属于自己的博客

[English](./README.es.md), [简体中文](./README.md).

## ✨ 特性

1. 简化配置，开箱即用
2. 初始化脚手架
3. 扩展 markdown 更多的语法支持
   1. 脚注
   2. 上标下标
   3. TodoList
   4. Katex 数学公式
   5. img 懒加载优化
   6. UML
4. 文章
   1. 置顶
   2. 封面图
   3. 创建时间
   4. 自动截取文章摘要
   5. 文件夹映射标签
5. 文章标签分类
6. 文章时间轴归档
7. 暗色亮色主题
8. 移动端支持

### Front Matter

```markdown
---
top: true
coverImg: xxxx
tags:
  - 随笔
---
```

## 主题

- default [预览](https://yue1123.github.io/vitepress-blog/defaultTheme/)

目前只开发了一个默认的主题，欢迎小伙伴们贡献自己的主题

## 从零快速开始

## 1. 安装

推荐使用 pnpm

```shell
mkdir blog && cd blog # Create an empty directory and go into it

# with npm
npm i vitepress vitepress-blog # Install the dependencies
npm i vitepress-blog -g # Install command line tools

# or with pnpm
pnpm add vitepress vitepress-blog
```

## 2. 初始化

在终端中运行`vitepress-blog init ./`，根据提示初始化 blog 相关配置文件。

```shell
vitepress-blog init ./

# And answer the following questions in CLI, for instance:

# ? What's the name of your project > myBlog

# ? What's your github name > yue1123

# Pick blog theme > defaultBlogTheme

# Pick language of configuration file > TypeScript

# ? Would you like to add start,build,preview commands to 'package.json' > yes
```

## 3. 运行 & 打包

初始化成功后，即可运行 blog

```shell
# 本地运行
pnpm run blog:dev
# 打包
pnpm run blog:build
```

## 文件夹结构

```shell
├── blog
│   └── site
│   │    └── posts # 博客存放文件夹，支持子文件夹
│   │    │   └── hello-vitepress-blog.md  # 示例文章
│   │    ├── public # 图片等公共资源文件夹
│   └── .vitepress
│   │    ├── theme
│   │    │   └── index.ts
│   │    └── config.mts
└── package.json
```

## Note

1. 建议阅读一下 [vitepress](https://vitepress.vuejs.org/) 文档以便深入使用
2. 如果使用 github-action 部署，请务必将 checkout `fetch-depth`设置为零，以保证文章创建时间正确
```yml
- name: Check out repo's default branch
  uses: actions/checkout@v3
  with:
    ref: "master"
    fetch-depth: 0
```

3. github 的仓库设置名字为`用户名.github.io`（这样就可以获得一个域名指向当前仓库）
4. 配置 git pages: 仓库 Settings > Pages > 选择 `gh-pages` 分支根目录 > 保存
