import fs from 'fs/promises'
import { resolve, join } from 'path'
import { Command } from 'commander'
import prompts from 'prompts'
import chalk from 'chalk'
import * as themes from '../client/theme/themes'

const program = new Command()
const root = process.cwd()
const guideContent = `---
tags:
  - 演示
  - markdown
---

# hello vitepress blog

[参考](https://vitepress.vuejs.org/guide/markdown)

## 扩展语法

### 指定封面图

\`\`\`md
---
coverImg: xxx
---
\`\`\`

### 置顶

\`\`\`md
---
top: true
---
\`\`\`

### 添加 tag

\`\`\`md
---
tags:
  - 随笔
---
\`\`\`


### [markdown-it-sub](https://github.com/markdown-it/markdown-it-sub)

C~7~H~14~O~2~

### [markdown-it-sup](https://github.com/markdown-it/markdown-it-sup)

Friday the 13^th^

### [markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists)

- [ ] Homework
- [x] Procrastinating

### 数学公式

多行公式块：

$$
\frac{1}{
  \Bigl(\sqrt{\phi \sqrt{5}}-\phi\Bigr) e^{
  \frac25 \pi}} = 1+\frac{e^{-2\pi}} {1+\frac{e^{-4\pi}} {
    1+\frac{e^{-6\pi}}
    {1+\frac{e^{-8\pi}}{1+\cdots}}
  }
}


$$

行内公式：

公式 $a^2 + b^2 = \color{red}c^2$ 是行内。

### UML


\`\`\`dot
digraph example1 {
    1 -> 2132123 -> { 4, 5 };
    1 -> 3 -> { 6, 7 };
}
\`\`\`


### 脚注

这里是一个脚注引用[^1]，这里是另一个脚注引用[^bignote]。

\`\`\`text
这里是一个脚注引用[^1]，这里是另一个脚注引用[^bignote]。
[^1]: 第一个脚注定义。
[^bignote]: 脚注定义可使用多段内容。

    缩进对齐的段落包含在这个脚注定义内。

    \`\`\`
    可以使用代码块。
    \`\`\`

    还有其他行级排版语法，比如**加粗**和[链接](https://b3log.org)。
\`\`\`

[\^1]: 第一个脚注定义。
[\^bignote]:
    脚注定义可使用多段内容。
    缩进对齐的段落包含在这个脚注定义内。

    \`\`\`text
    可以使用代码块。
    \`\`\`

    还有其他行级排版语法，比如**加粗**和[链接](https://b3log.org)。`

program
  .name('vitepress-blog')
  .description('Expand vitepress for ssg blog')
  .version('__VERSION__', '-v, --version', 'output the current version')

program
  .command('init')
  .arguments('rootPath')
  .description('Init vitepress-blog site root folder and must files.')
  .option('-r --regenerate', 'Regenerate site root folder and must files.')
  .action(async (_rootPath, { regenerate }) => {
    async function fsExists(path: string) {
      try {
        await fs.access(path, 0)
      } catch (e) {
        return false
      }
      return true
    }
    async function addCommandToPackageJson(sitePath: string) {
      const path = resolve(root, 'package.json')
      let content = '{}'
      if (await fsExists(path)) {
        content = (await fs.readFile(path, { encoding: 'utf-8' })).toString()
      }
      const indent = content.match(/(\x20+)/)?.[1]?.length || 4
      const obj = JSON.parse(content)
      obj.scripts = Object.assign(obj.scripts || {}, {
        'blog:dev': `vitepress dev ${sitePath}`,
        'blog:build': `vitepress build ${sitePath}`,
        'blog:serve': `vitepress serve ${sitePath}`
      })
      await fs.writeFile(path, JSON.stringify(obj, null, indent), { encoding: 'utf-8' })
    }
    function getTheme(_theme: string, pages: Record<string, any>) {
      const theme = pages[_theme]
      let themePagesFileTasks = []
      let nav: string[] = []
      if (theme) {
        const pages = theme.pages || []
        themePagesFileTasks = pages.map((item: any) => {
          nav.push(`{ text: "${item.title}", link: "${item.link}" }`)
          return {
            filePath: getPath(`./site/${item.name}.md`),
            content: `---
aside: ${item.aside?.toString()}
title: ${item.title}
---

<${item.componentName} />
      `
          }
        })
        return { themePagesFileTasks, nav: nav.join(', ') }
      } else {
        throw new Error(`✘ Error: make sure ${theme} has exported pages`)
      }
    }
    function getThemeList(themes: Record<string, Record<'name' | 'description' | 'previewLink' | 'pages', any>>) {
      return Object.keys(themes).map((item) => {
        const { name, previewLink, description } = themes[item]
        return {
          title: name,
          description: `${description} ${previewLink}`,
          value: name
        }
      })
    }
    const rootPath = resolve(root, _rootPath)
    const isRootPathExist = _rootPath === './' || (await fsExists(_rootPath))
    const getPath = (path: string) => join(rootPath, path)
    const taskList: any[] = [
      {
        filePath: getPath('./site/posts/hello-vitepress-blog.md'),
        content: guideContent
      }
    ]
    const { lang, theme, title, addCommand, name } = await prompts(
      [
        {
          type: 'text',
          name: 'title',
          message: "What's the name of your project ?"
        },
        {
          type: 'text',
          name: 'name',
          message: "What's your github name ?"
        },
        {
          type: 'select',
          name: 'theme',
          message: 'Pick blog theme',
          choices: getThemeList(themes)
        },
        {
          type: 'select',
          name: 'lang',
          message: 'Pick language of configuration file',
          choices: [
            { title: 'JavaScript', value: 'mjs' },
            { title: 'TypeScript', value: 'mts' }
          ]
        },
        {
          type: 'confirm',
          name: 'addCommand',
          message: `Would you like to add start,build,preview commands to 'package.json' ?`,
          initial: true
        }
      ],
      {
        onCancel() {
          console.log(chalk.red('Cancel initial.'))
        }
      }
    )
    try {
      if (!lang || !theme || !title) return
      taskList.unshift.apply(taskList, [
        {
          async before() {
            const path = getPath(`./.vitepress/theme`)
            if (!(await fsExists(path))) {
              await fs.mkdir(path, { recursive: true })
            }
          },
          filePath: getPath(`./.vitepress/theme/index.${lang.replace('m', '')}`),
          content: `import { ${theme} } from 'vitepress-blog/theme'

export default ${theme}
`
        }
      ])
      const { themePagesFileTasks, nav } = getTheme(theme, themes)
      taskList.push.apply(taskList, themePagesFileTasks)
      taskList.push({
        async before() {
          const path = getPath(`./.vitepress`)
          if (!(await fsExists(path))) {
            await fs.mkdir(path)
          }
        },
        filePath: getPath(`./.vitepress/config.${lang}`),
        content: `import { defineConfig } from 'vitepress-blog'

export default defineConfig({
  srcDir: '${_rootPath}',
  title: '${title}',
  themeConfig: {
    name: '${name}',
    nav: [${nav}],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/${name}' },
    ],
    filePathToTags: [
      {
        test: /\\/notes\\//,
        tag: '随笔'
      }
    ],
    sortBy: 'CREATE_TIME',
    footer: {
      copyright: 'Copyright © 2023-present ${name}'
    }
  }
})
`
      })
      if (!isRootPathExist) {
        await fs.mkdir(rootPath, { recursive: true })
      }
      const path = getPath('./site/posts/')
      if (!(await fsExists(path))) {
        await fs.mkdir(path, { recursive: true })
      }
      let existedCount = 0
      const taskPromises = taskList.map(async (item: any) => {
        if (item.before) await item.before()
        if (regenerate || !(await fsExists(item.filePath))) {
          return fs.writeFile(item.filePath, item.content, { encoding: 'utf-8' }).then((res) => {
            regenerate
              ? console.log(chalk.green(`${item.filePath} is regenerated.`))
              : console.log(chalk.green(`File ${item.filePath} is created.`))
          })
        } else {
          existedCount += 1
          console.log(chalk.dim(`${item.filePath} is existed, skip creation.`))
        }
      })
      if (addCommand) {
        taskPromises.push(addCommandToPackageJson(_rootPath).then())
      }
      Promise.all(taskPromises)
        .then(() => {
          console.log('\n')
          console.log('Initial completion.')
          if (existedCount > 0) {
            console.log(
              `${chalk.blue(
                'ℹ'
              )} If you want to regenerate these existed files, add \`-r\` or \`--regenerate\` to regenerate.`
            )
          }
          if (addCommand) {
            console.log(`${chalk.blue('ℹ')} Run \`npm run blog:dev\` to start blog`)
          } else {
            console.log(
              `${chalk.blue(
                'ℹ'
              )} Add \`vitepress dev ${_rootPath}\` scripts to \`${_rootPath}package.json\` and run it to start blog`
            )
          }
        })
        .catch((err) => {
          console.error(chalk.red('✘ Initial fail.'))
          console.error(err)
        })
    } catch (error) {
      console.error(chalk.red('✘ Initial fail.'))
      console.error(error)
    }
  })
program.parse()
