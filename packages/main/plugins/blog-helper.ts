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
            createTime = createTimeCache[id] = stat.birthtimeMs + ''
          }
          console.log(createTimeCache)
          console.log('c', createTime)
          console.log('g', await getFileCreateTime(id))
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
            updateTime = updateTimeCache[id] = stat.mtimeMs + ''
          }
        } else {
          updateTime = updateTimeCache[id] = (await getFileUpdateTime(id)) + ''
        }
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
        title: path.basename(id, '.md'),
        tags: tags,
        snippets: getSnippets(code, themeConfig.snippetsLength || 50),
        isPost: true
      })
    }
  }
}
