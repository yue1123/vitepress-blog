import path from 'path'
import fs from 'fs'
import type { Plugin } from 'vite'
import { type UserThemeConfig } from '../index'
import { getFileUpdateTime, getFileCreateTime, appendFrontmatter, getSnippets } from '../utils/index'

export default function blogHelper(userConfig: UserThemeConfig): Plugin {
  const { themeConfig = {} } = userConfig
  let config: any
  const createTimeCache = Object.create(null)
  const updateTimeCache = Object.create(null)
  return {
    name: 'blog-helper',
    enforce: 'pre',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    handleHotUpdate({ file }) {
      if (createTimeCache[file]) createTimeCache[file] = null
      if (updateTimeCache[file]) updateTimeCache[file] = null
    },
    async transform(code, id) {
      if (!id.endsWith('.md') || !/\/posts\//.test(id)) return
      let tags: string[] = []
      // get createTime
      let createTime: string | null = createTimeCache[id] || null
      if (!createTimeCache[id]) {
        // get file create time by git commit when build command run
        // otherwise file create time will refresh when per build on github ci environment
        if (config.command !== 'build') {
          const stat = fs.statSync(id)
          if (!!stat) {
            createTime = createTimeCache[id] = Math.floor(stat.birthtimeMs) + ''
          }
        } else {
          createTime = createTimeCache[id] = (await getFileCreateTime(id)) + ''
        }
      }

      // get createTime
      let updateTime: string | null = createTimeCache[id] || null
      if (!updateTimeCache[id]) {
        // get file create time by git commit when build command run
        // otherwise file create time will refresh when per build on github ci environment
        if (config.command !== 'build') {
          const stat = fs.statSync(id)
          if (!!stat) {
            updateTime = updateTimeCache[id] = Math.floor(stat.mtimeMs) + ''
          }
        } else {
          updateTime = updateTimeCache[id] = (await getFileUpdateTime(id)) + ''
        }
      }
      // title
      let title = path.basename(id, '.md')
      // match first title reg
      let titleReg = /\x20*\# (.+)/
      if (themeConfig.titleOrder && themeConfig.titleOrder === 'contentTitle') {
        const res = code.match(titleReg)
        if (res && res[1]) {
          title = res[1]
        }
        // remove origin code title string
        code = code.replace(titleReg, '')
      }
      // get tags
      if (themeConfig.filePathToTags) {
        tags = themeConfig.filePathToTags.reduce<string[]>((tags, { test: reg, tag }) => {
          if (reg.test(id)) {
            typeof tag === 'string' ? tags.push(tag) : tags.push.apply(tags, tag)
          }
          return tags
        }, [])
      }

      return appendFrontmatter(code, {
        createTime,
        updateTime,
        title,
        tags: tags,
        snippets: getSnippets(code, themeConfig.snippetsLength || 50),
        isPost: true
      })
    }
  }
}
