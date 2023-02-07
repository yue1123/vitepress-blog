import { cyan, blue, yellow, bold, dim, red } from 'chalk'
import { version } from './package.json'
import { existsSync, mkdirSync, readdirSync, rmdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, join, relative, basename } from 'path'
import { Command } from 'commander'
import prompts from 'prompts'
import { sync as execaSync } from 'execa'
import { ThemeMetaConfig } from 'types'

import {
  getOfficialThemeChoices,
  emptyDir,
  checkUserInputTheme,
  packageNameRegExp,
  getSuggestedPackageName,
  copy,
  replaceTemplate
} from './utils'

const cwd = process.cwd()

const renameFiles: Record<string, string> = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc'
}

const excludeFiles: string[] = ['.vitepress']
let tempDir: string = ''
const rmTempDir = () => {
  try {
    tempDir && rmdirSync(tempDir)
  } catch {}
}
const commonCancelTips = {
  onCancel() {
    rmTempDir()
    console.error(red('✘ Cancel creation.'))
  }
}

function combineThemeMeta(meta: ThemeMetaConfig, root: string) {
  let themePagesFileTasks = []
  let nav: string[] = []
  const pages = meta.pages || []
  themePagesFileTasks = pages.map((item: any) => {
    nav.push(`{ text: "${item.title}", link: "${item.link}" }`)
    return {
      filePath: `./site/${item.name}.md`,
      content: `---
aside: ${item.aside?.toString()}
title: ${item.title}
---

<${item.componentName} />
      `
    }
  })
  return { themePagesFileTasks, nav: nav.join(', ') }
}

async function main() {
  console.log()
  console.log(`${cyan('┬  ┌┬┌─┌─┬─┌─┌─┌─┐')} ${yellow('┌┐┬ ┌─┌─┐')}`)
  console.log(`${cyan('└┐┌││├┤├─├┬├┤└─└──')}-${yellow('├┴│ │ │ ┬')}`)
  console.log(`${cyan(' └┘┴┴└─┴ ┴└└─└─└─┘')} ${yellow('└─┴─└─└─┘')}`)
  console.log()
  console.log(`${bold('  Vitepress blog') + dim(' Creator')}  ${blue(`v${version}`)}`)
  console.log()

  const program = new Command()

  program.arguments('[targetDir]').action(async (targetDir: string) => {
    // save origin dir if only specify path and not folder
    let _targetDir = targetDir
    let isValid = packageNameRegExp.test(basename(targetDir || '') || '')
    let packageName: string = isValid ? getSuggestedPackageName(basename(targetDir)) : ''
    if (!targetDir || !isValid) {
      const { projectName } = await prompts(
        {
          type: 'text',
          name: 'projectName',
          message: 'Project name:',
          initial: 'vitepress-blog',
          validate(value) {
            return packageNameRegExp.test(value)
              ? true
              : `Invalid project name. Suggested name: ${getSuggestedPackageName(value)}`
          }
        },
        commonCancelTips
      )
      if (!projectName) return
      packageName = projectName
      targetDir = projectName.trim()
    }

    const root = join(cwd, _targetDir && !isValid ? _targetDir : '', targetDir)

    if (!existsSync(root)) {
      mkdirSync(root, { recursive: true })
    } else {
      const existing = readdirSync(root)
      if (existing.length) {
        console.log(yellow(`  Target directory "${targetDir}" is not empty.`))
        const { yes } = await prompts({
          type: 'confirm',
          name: 'yes',
          initial: 'Y',
          message: 'Remove existing files and continue?'
        })
        if (yes) emptyDir(root)
        else return
      }
    }
    tempDir = targetDir
    console.log(dim('  Scaffolding project in ') + targetDir + dim(' ...'))
    console.log()
    const templateDir = join(__dirname, '../template')
    const write = (file: string, content?: string) => {
      const targetPath = renameFiles[file] ? join(root, renameFiles[file]) : join(root, file)
      if (content) writeFileSync(targetPath, content)
      else copy(join(templateDir, file), targetPath)
    }

    const pkgManager =
      /pnpm/.test(process.env.npm_execpath || '') || /pnpm/.test(process.env.npm_config_user_agent || '')
        ? 'pnpm'
        : /yarn/.test(process.env.npm_execpath || '')
        ? 'yarn'
        : 'npm'
    const related = relative(cwd, root)
    const { lang, title, theme, name, agent } = await prompts(
      [
        {
          type: 'text',
          name: 'title',
          message: "What's your blog title ?"
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
          choices: [
            ...getOfficialThemeChoices(),
            {
              title: 'use community themes',
              value: 'community'
            }
          ]
        },
        {
          type: (prev) => (prev == 'community' ? 'text' : null),
          name: 'theme',
          message: 'Community theme package name',
          async validate(value) {
            try {
              return await checkUserInputTheme(value)
            } catch (error) {
              return error
            }
          }
        },
        {
          type: 'select',
          name: 'lang',
          message: 'Pick language of configuration file',
          choices: [
            { title: 'JavaScript', value: 'js' },
            { title: 'TypeScript', value: 'ts' }
          ]
        },
        {
          name: 'agent',
          type: 'select',
          message: 'Choose the agent',
          choices: ['npm', 'yarn', 'pnpm'].map((i) => ({ value: i, title: i }))
        }
      ],
      commonCancelTips
    )
    if (!lang || !title || !name || !agent) return

    // copy template
    const files = readdirSync(templateDir)
    for (const file of files.filter((f) => f !== 'package.json' && excludeFiles.indexOf(f) === -1)) write(file)
    // rename package.json name field
    const pkg = require(join(templateDir, 'package.json'))

    pkg.name = packageName
    if (theme) {
      pkg.dependencies = Object.assign(pkg.dependencies, {
        [theme]: 'latest'
      })
    }
    write('package.json', JSON.stringify(pkg, null, 2))

    // install
    execaSync(agent, ['install'], { stdio: 'inherit', cwd: root })

    // config combine
    const configWriteTasks = []
    if (theme) {
      const themeMetaConfig = require(join(root, 'node_modules', theme, 'config.json'))
      if (!themeMetaConfig) {
        throw new Error(`✘ Error: make sure ${theme} has exported pages`)
      }
      const { themePagesFileTasks, nav } = combineThemeMeta(themeMetaConfig, root)
      configWriteTasks.push({
        async before() {
          const path = join(root, `./.vitepress/theme`)
          if (!existsSync(path)) {
            mkdirSync(path, { recursive: true })
          }
        },
        filePath: `./.vitepress/theme/index.${lang}`,
        content: replaceTemplate(readFileSync(join(templateDir, './.vitepress/theme/_index')).toString(), {
          themeName: themeMetaConfig.name,
          theme
        })
      })
      configWriteTasks.push({
        async before() {
          const path = join(root, `./.vitepress`)
          if (!existsSync(path)) {
            mkdirSync(path)
          }
        },
        filePath: `./.vitepress/config.${lang}`,
        content: replaceTemplate(readFileSync(join(templateDir, './.vitepress/_config')).toString(), {
          name,
          title,
          nav
        })
      })
      configWriteTasks.push.apply(configWriteTasks, themePagesFileTasks)
    } else {
      configWriteTasks.push({
        async before() {
          const path = join(root, `./.vitepress`)
          if (!existsSync(path)) {
            mkdirSync(path)
          }
        },
        filePath: `./.vitepress/config.${lang}`,
        content: replaceTemplate(readFileSync(join(templateDir, './.vitepress/_config')).toString(), {
          name,
          title,
          nav: ''
        })
      })
    }
    const asyncTask = configWriteTasks.map(async ({ before, filePath, content }) => {
      if (before) await before()
      write(filePath, content)
    })
    Promise.all(asyncTask)
      .then(() => {
        console.log(dim('\n  Start it later by:\n'))
        if (root !== cwd) console.log(blue(`  cd ${bold(related)}`))

        console.log(blue(`  ${pkgManager === 'npm' ? 'npm run blog:dev' : `${pkgManager} blog:dev`}`))
        console.log()
      })
      .catch((e) => {
        throw e
      })
  })
  program.parse()
}

main().catch((e) => {
  rmTempDir()
  console.error(e)
})
