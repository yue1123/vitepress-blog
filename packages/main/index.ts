import { resolve } from 'path'
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
   * @enum[] UPDATE_TIME 更新时间
   * @default CREATE_TIME
   */
  sortBy?: 'CREATE_TIME' | 'RANDOM' | 'UPDATE_TIME'
  /**
   * 文章标题名字
   * @enum[] fileName 文件名字优先
   * @enum[] contentTitle 文章内容标题优先
   * @default fileName
   */
  titleOrder?: 'fileName' | 'contentTitle'
  pagination?: {
    /**
     * 上一页文字
     */
    prevText?: string
    /**
     * 下一页文字
     */
    nextText?: string
    /**
     * 每页显示条目个数
     */
    size?: number
    /**
     * 页码按钮的数量，可根据该属性折叠分页按钮
     */
    pagerCount?: number
    /**
     * 只有一页时是否隐藏
     */
    hideOnSinglePage?: boolean
  }
}
export type UserThemeConfig = UserConfig<ThemeConfig>

const getSharedConfig = (userConfig: any) => {
  return {
    cacheDir: resolve(process.cwd(), './node_modules/.vitepress'),
    markdown: {
      config: (md: any) => expandMarkdownIt(md)
    },
    vite: { plugins: [blogHelper(userConfig)] },
    themeConfig: {
      outline: [1, 5],
      sortby: 'CREATE_TIME',
      titleOrder: 'fileName',
      pagination: {
        prevText: '上一页',
        nextText: '下一页',
        size: 10,
        pagerCount: 7,
        hideOnSinglePage: true
      }
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
  return deepmerge(getSharedConfig(config), config)
}

export { defineConfig }
