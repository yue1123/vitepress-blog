import { type UserConfig, type DefaultTheme } from 'vitepress'
import blogHelper from './plugins/blog-helper'
import { expandMarkdownIt } from './plugins/expand-markdown-it'
import deepmerge from 'deepmerge'

export interface ThemeConfig extends DefaultTheme.Config {
  name?: string
  snippetsLength?: number
  /**
   * 文章根据文件路径添加标签
   * @examples { test: /notes/, tag: '随笔' }
   */
  filePathToTags?: {
    test: RegExp
    tag: string | string[]
  }[]
  /**
   * 首页文章排序方式
   * @enum[] CREATE_TIME 创建时间
   * @enum[] RANDOM 随机
   */
  sortBy?: 'CREATE_TIME' | 'RANDOM'
  /**
   * 文章标题名字
   * @enum[] fileNameFirst 文件名字优先
   * @enum[] contentTitleFirst 文章内容标题优先
   */
  titleString?: 'fileNameFirst' | 'contentTitleFirst'
}
export type UserThemeConfig = UserConfig<ThemeConfig>

const getSharedConfig = (userConfig: any) => {
  return {
    srcDir: './site',
    markdown: {
      config: (md: any) => expandMarkdownIt(md)
    },
    vite: { plugins: [blogHelper(userConfig)] },
    themeConfig: {
      outline: [1, 5]
    },
    head: [
      [
        'link',
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css'
        }
      ]
    ]
  }
}

function defineConfig(config: UserThemeConfig): UserThemeConfig {
  return deepmerge(config, getSharedConfig(config))
}

export { defineConfig }
