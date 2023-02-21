import fs from 'fs/promises'
import { resolve, join } from 'path'
import { Command } from 'commander'
import prompts from 'prompts'
import chalk from 'chalk'
import themeResolver from './themeResolver'

type ThemeConfig = Record<'name' | 'description' | 'previewLink' | 'pages', any>
function main() {
  const program = new Command()
  const root = process.cwd()
  const guideContent = ``
  const installedTheme = themeResolver(root)
  if (!installedTheme) return
  program
    .name('vitepress-blog')
    .description('Expand vitepress for ssg blog')
    .version(__VERSION__, '-v, --version', 'output the current version')

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
      function getThemeConfigTask(theme: ThemeConfig) {
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
      function getThemeList(themes: ThemeConfig[]) {
        return themes.map((item) => {
          const { name, previewLink, description } = item
          return {
            title: name,
            description: `${description} ${previewLink}`,
            value: item
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
            choices: getThemeList(installedTheme)
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
            content: `import { ${theme.name} as theme } from '@upress-theme/${theme.name}'

export default theme
`
          }
        ])
        const { themePagesFileTasks, nav } = getThemeConfigTask(theme)
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
  srcDir: '${_rootPath}/site',
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
}

main()
