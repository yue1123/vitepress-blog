# vitepress-blog

Based on the static blog generation of vitepress, build a blog of your own in five minutes

[English](./README.es.md), [简体中文](./README.md).

## ✨ Features

1. Simplified configuration, out of the box
2. Initialize the scaffold
3. Extend markdown to support more syntax
    1. Footnotes
    2. Superscript and subscript
    3. Todo List
    4. Katex math formula
    5. img lazy loading optimization
    6. UML
4. Articles
    1. Top
    2. Cover image
    3. Creation time
    4. Automatically intercept article abstracts
    5. Folder Mapping Tab
5. Article label classification
6. Article Timeline Archive
7. Dark Light Theme
8. Mobile support

### Front Matter

```markdown
---
top: true
coverImg: xxxx
tags:
   - Essay
---
```

## theme

- default [Preview](https://yue1123.github.io/vitepress-blog/defaultTheme/)

At present, only one default theme has been developed, and friends are welcome to contribute their own themes

## Quick start from zero

## 1. Installation

It is recommended to use pnpm

```shell
mkdir blog && cd blog # Create an empty directory and go into it

# with npm
npm i vitepress vitepress-blog # Install the dependencies
npm i vitepress-blog -g # Install command line tools

# or with pnpm
pnpm add vitepress vitepress-blog
```

## 2. Initialization

Run `vitepress-blog init ./` in the terminal, and initialize blog-related configuration files according to the prompts.

```shell
vitepress-blog init ./

# And answer the following questions in CLI, for instance:

# ? What's the name of your project > myBlog

# ? What's your github name > yue1123

# Pick blog theme > defaultBlogTheme

# Pick language of configuration file > TypeScript

# ? Would you like to add start,build,preview commands to 'package.json' > yes
```

## 3. Run & build

After the initialization is successful, you can run the blog

```shell
# run locally
pnpm run blog:dev
# Pack
pnpm run blog:build
```

## Folder structure

```shell
├── blog
│ └── site
│ │ └── posts # blog storage folder, support subfolders
│ │ │ └── hello-vitepress-blog.md # sample article
│ │ ├── public # Pictures and other public resource folders
│ └── .vitepress
│ │ ├── theme
│ │ │ └── index.ts
│ │ └── config.mts
└── package.json
```

##Note

1. It is recommended to read the [vitepress](https://vitepress.vuejs.org/) document for in-depth use
2. If you use github-action deployment, be sure to set checkout `fetch-depth` to zero to ensure that the article creation time is correct
```yml
- name: Check out repo's default branch
  uses: actions/checkout@v3
  with:
    ref: "master"
    fetch-depth: 0
```
3. Set the name of the github warehouse to `username.github.io` (so that you can get a domain name pointing to the current warehouse)
4. Configure git pages: warehouse Settings > Pages > select `gh-pages` branch root directory > save
